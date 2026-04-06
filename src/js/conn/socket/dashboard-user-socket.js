const { getUserMatchHistory } = require('../../../../database/matchOperations.js');

module.exports = function registerUserSocketHandlers(socket, db, bcrypt, jwt, helpers) {
    const { verifySession, verifyAdmin, getUserPrimaryRole } = helpers;

    socket.on("request_get_user_account_profile", async ({ token_session }) => {
        try {
            console.log("Profile request received on socket", socket.id);

            // prefer authenticated handshake user if available
            let session = null;
            if (socket.user && (socket.user.id || socket.user.userId)) {
                session = { userId: socket.user.id || socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for profile request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for profile request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit("response_get_user_account_profile", { success: false, message: 'Invalid session' });
                return;
            }

            const [rows] = await db.query(
                `SELECT u.user_id, u.username, u.email, p.avatar_url, p.full_name, p.bio, p.country
                 FROM users u
                 LEFT JOIN profiles p ON u.user_id = p.user_id
                 WHERE u.user_id = ?`,
                [session.userId]
            );

            if (rows.length === 0) {
                socket.emit("response_get_user_account_profile", { success: false, message: 'Profile not found' });
                return;
            }

            const p = rows[0];

            // return full profile but do NOT include password
            socket.emit("response_get_user_account_profile", {
                success: true,
                username: p.username,
                email: p.email,
                avatar_url: p.avatar_url,
                full_name: p.full_name || '',
                bio: p.bio || '',
                country: p.country || ''
            });


        } catch (err) {
            console.error(err);
            socket.emit("response_get_user_account_profile", { success: false, message: 'Server error' });
        }
    });

    socket.on("request_get_user_statistics", async ({ token_session }) => {
        try {
            console.log("Statistic request received on socket", socket.id);

            // prefer authenticated handshake user if available
            let session = null;
            if (socket.user && (socket.user.id || socket.user.userId)) {
                session = { userId: socket.user.id || socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for profile request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for statistic request');
                session = await verifySession(token_session);
            }
            if (!session) {
                socket.emit("response_get_user_statistics", { success: false, message: 'Invalid session statistics' });
                return;
            }

            const [rows] = await db.query(
                `
                SELECT 
                    s.statistic_level, s.statistic_level_xp, s.statistic_duel_point
                FROM 
                    statistic s, users u
                WHERE 
                    s.user_id = u.user_id
                    AND u.user_id = ?;
                `,
                [session.userId]
            );

            if (rows.length === 0) {
                socket.emit("response_get_user_statistics", { success: false, message: 'Stats not found huh' });
                return;
            }

            // return statistics
            socket.emit("response_get_user_statistics", {
                success: true,
                statistic_level: rows[0].statistic_level,
                statistic_level_xp: rows[0].statistic_level_xp,
                statistic_duel_point: rows[0].statistic_duel_point
            });

        } catch (err) {
            console.error(err);
            socket.emit("response_get_user_statistics", { success: false, message: 'Server error' });
        }
    });

    // === request and response user account change (standardized: username, email, password, avatar_url)
    socket.on('request_change_user_account_profile', async (data) => {
        const { username, email, password, previousPassword, full_name, bio, country, avatar_url, token_session } = data;
        console.log('[Socket] request_change_user_account_profile payload:', { username, email, hasPassword: !!password, full_name, bio, country, avatar_url });
        try {
            // 1. Prefer socket.user (handshake) then fallback to token_session verification
            let session = null;
            if (socket.user && (socket.user.id || socket.user.userId)) {
                session = { userId: socket.user.id || socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for change request', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for change request');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_change_user_account_profile', { success: false, message: 'Invalid session' });
                return;
            }

            const [userRows] = await db.query(
                `SELECT u.user_id, u.password, u.email, u.username, p.avatar_url, p.full_name, p.bio, p.country
                 FROM users u
                 LEFT JOIN profiles p ON u.user_id = p.user_id
                 WHERE u.user_id = ?
                `,
                [session.userId]
            );

            if (userRows.length === 0) {
                socket.emit('response_change_user_account_profile', { success: false, message: 'User not found' });
                return;
            }

            const user = userRows[0];

            // 2. Check if email is being changed and already exists
            if (email && email !== user.email) {
                const [emailRows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
                if (emailRows.length > 0) {
                    socket.emit('response_change_user_account_profile', { success: false, message: 'Email is already used' });
                    return;
                }
            }

            // 3. Determine if password should be updated
            let hashedPassword = user.password;

            if (password) {
                if (!previousPassword) {
                    socket.emit('response_change_user_account_profile', { success: false, message: 'Please enter your current password' });
                    return;
                }

                const isMatch = await bcrypt.compare(previousPassword, user.password);
                if (!isMatch) {
                    socket.emit('response_change_user_account_profile', { success: false, message: 'Incorrect current password' });
                    return;
                }

                hashedPassword = await bcrypt.hash(password, 10);
            }

            // 4. Update user record in a transaction
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                await connection.query(
                    `UPDATE users SET username = ?, email = ?, password = ? WHERE user_id = ?`,
                    [username || user.username, email || user.email, hashedPassword, user.user_id]
                );

                // 4b. Upsert profile record
                const [profileRows] = await connection.query('SELECT user_id FROM profiles WHERE user_id = ?', [user.user_id]);
                
                if (profileRows.length > 0) {
                    await connection.query(
                        'UPDATE profiles SET full_name = ?, bio = ?, country = ?, avatar_url = COALESCE(?, avatar_url) WHERE user_id = ?',
                        [
                            full_name !== undefined ? full_name : user.full_name, 
                            bio !== undefined ? bio : user.bio, 
                            country !== undefined ? country : user.country,
                            avatar_url !== undefined ? avatar_url : null,
                            user.user_id
                        ]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO profiles (user_id, avatar_url, full_name, bio, country) VALUES (?, ?, ?, ?, ?)',
                        [user.user_id, avatar_url || null, full_name || null, bio || null, country || null]
                    );
                }

                await connection.commit();
            } catch (err) {
                await connection.rollback();
                throw err;
            } finally {
                connection.release();
            }

            // 5. Re-query full profile (without password) and then emit to frontend
            const [updatedRows] = await db.query(
                `SELECT u.user_id, u.username, u.email, p.avatar_url, p.full_name, p.bio, p.country
                 FROM users u
                 LEFT JOIN profiles p ON u.user_id = p.user_id
                 WHERE u.user_id = ?`,
                [user.user_id]
            );

            if (updatedRows.length === 0) {
                socket.emit('response_change_user_account_profile', { success: false, message: 'User not found after update' });
                return;
            }

            socket.emit("response_change_user_account_profile", {
                success: true,
                username: updatedRows[0].username,
                full_name: updatedRows[0].full_name || '',
                avatar_url: updatedRows[0].avatar_url,
                email: updatedRows[0].email
            });

        } catch (err) {
            console.error(err);
            socket.emit('response_change_user_account_profile', { success: false, message: 'Server error' });
        }
    });

    // === request and response for changing avatar image ===
    socket.on('request_change_user_account_profile_avatar', async ({ imageBase64, image, img, token_session }) => {
        try {
            console.log('Avatar change request received', { hasImageBase64: !!imageBase64, hasImage: !!image, hasImg: !!img });
            
            // determine session (prefer handshake-authenticated socket.user)
            let session = null;
            if (socket.user && (socket.user.id || socket.user.userId)) {
                session = { userId: socket.user.id || socket.user.userId, decoded: socket.user.decoded };
                console.log('Using socket.user for avatar change', { socketId: socket.id, userId: session.userId });
            } else {
                console.log('Falling back to token_session for avatar change');
                session = await verifySession(token_session);
            }

            if (!session) {
                socket.emit('response_change_user_account_profile_avatar', { success: false, message: 'Invalid session' });
                return;
            }

            // Accept multiple possible field names from client: imageBase64, image, img
            const rawImage = imageBase64 || image || img || null;
            if (!rawImage) {
                socket.emit('response_change_user_account_profile_avatar', { success: false, message: 'No image provided' });
                return;
            }

            console.log('Raw image length:', rawImage.length, 'First 50 chars:', rawImage.substring(0, 50));

            // strip data URL prefix if present
            const matches = rawImage.match(/^data:(image\/(png|jpeg|jpg));base64,(.+)$/);
            let base64Data = rawImage;
            let ext = 'jpg';
            if (matches) {
                base64Data = matches[3];
                ext = matches[2] === 'png' ? 'png' : 'jpg';
            }

            const fs = require('fs');
            const path = require('path');

            // __dirname is src/js/conn/socket — go up four levels to project root then into public/asset/profile
            const publicProfileDir = path.join(__dirname, '../../../../public/asset/profile');

            // ensure directory exists
            try {
                await fs.promises.mkdir(publicProfileDir, { recursive: true });
            } catch (e) {
                console.warn('Could not create profile directory', e);
            }

            const fileName = `avatar_${session.userId}_${Date.now()}.${ext}`;
            const filePath = path.join(publicProfileDir, fileName);

            console.log('Writing avatar to:', filePath);
            const buffer = Buffer.from(base64Data, 'base64');
            console.log('Buffer length:', buffer.length);
            await fs.promises.writeFile(filePath, buffer);
            console.log('Avatar file written successfully');

            // store relative path for client use (match existing asset structure)
            const avatarUrl = `asset/profile/${fileName}`;

            await db.query('UPDATE profiles SET avatar_url = ? WHERE user_id = ?', [avatarUrl, session.userId]);
            console.log('Profile updated with new avatar_url:', avatarUrl);

            // Re-query the updated full profile (without password)
            const [rows] = await db.query(
                `SELECT p.*, u.email, u.username 
                 FROM profiles p 
                 JOIN users u ON p.user_id = u.user_id 
                 WHERE p.user_id = ?`,
                [session.userId]
            );

            if (rows.length === 0) {
                socket.emit('response_change_user_account_profile_avatar', { success: false, message: 'Profile not found after save' });
                return;
            }

            const profile = rows[0];

            // emit avatar-specific response and the general profile update so listeners stay in sync
            console.log('Emitting response_change_user_account_profile_avatar with avatar_url:', profile.avatar_url);
            socket.emit('response_change_user_account_profile_avatar', { success: true, avatar_url: profile.avatar_url, full_name: profile.full_name, bio: profile.bio, email: profile.email, username: profile.username });

            socket.emit('response_change_user_account_profile', {
                success: true,
                user_id: session.userId,
                username: profile.username,
                email: profile.email,
                full_name: profile.full_name || '',
                bio: profile.bio || '',
                avatar_url: profile.avatar_url || ''
            });

        } catch (err) {
            console.error('Avatar change error', err);
            socket.emit('response_change_user_account_profile_avatar', { success: false, message: 'Server error' });
        }
    });

    // === USER: Match History (own matches)
    socket.on('request_get_user_match_history', async ({ token_session, limit }) => {
        try {
            // prefer authenticated handshake
            let session = null;
            if (socket.user && (socket.user.userId || socket.user.id)) {
                const uid = socket.user.userId || socket.user.id;
                session = { userId: uid, decoded: socket.user.decoded };
            } else {
                session = await verifySession(token_session);
            }
            if (!session) {
                socket.emit('response_get_user_match_history', { success: false, message: 'Invalid session' });
                return;
            }

            const lim = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(200, Number(limit))) : 50;
            const rows = await getUserMatchHistory(db, session.userId, lim);
            socket.emit('response_get_user_match_history', { success: true, matches: rows });
        } catch (err) {
            console.error('[user] request_get_user_match_history error', err);
            socket.emit('response_get_user_match_history', { success: false, message: 'Server error' });
        }
    });
};
