function SigninAndSignupSocket(socket, db, bcrypt, jwt){
    // === Signup logic === done !
    socket.on('signup', async ({ username, email, password }) => {
        try {
            const [rows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
            if (rows.length > 0) {
                socket.emit('signup_result', { success: false, message: 'Email already taken' });
                return;
            }

            const hashed = await bcrypt.hash(password, 10);

            // Use a transaction to create user + profile + statistic + session atomically
            let connection = null;
            try {
                connection = await db.getConnection();
                await connection.beginTransaction();

                const [result] = await connection.query(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, hashed]
                );

                const userId = result.insertId;

                // Create profile row and copy username into full_name
                await connection.query(
                    'INSERT INTO profiles (user_id, full_name, bio, avatar_url) VALUES (?, ?, ?, ?)',
                    [userId, username, null, null]
                );

                // Create initial statistic row
                await connection.query(
                    `INSERT INTO statistic (user_id, statistic_level, statistic_level_xp, statistic_duel_point, abandon_count, is_banned, last_abandon_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, 1, 0, 0, 0, 0, null]
                );

                // jwt conn  - step 1/5
                const user = { id: userId, username, email, role: 0 };
                const token = jwt.sign(user, process.env.JWT_SECRET);

                // Save session to database (expires in 7 days)
                await connection.query(
                    'INSERT INTO active_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
                    [userId, token]
                );

                await connection.commit();
                socket.emit('signup_result', { success: true, token });
            } catch (txErr) {
                console.error('Signup transaction error:', txErr);
                try { if (connection) await connection.rollback(); } catch (rerr) { console.error('Rollback error:', rerr); }
                socket.emit('signup_result', { success: false, message: 'Signup failed' });
            } finally {
                if (connection) connection.release();
            }
        } catch (err) {
            console.error(err);
            socket.emit('signup_result', { success: false, message: 'Server error' });
        }
    });
    // === Signin logic (with login function for header) ===

    socket.on('signin', async ({ email, password }) => {
        try {
            // 1. Get user + profile picture using JOIN
            const [rows] = await db.query(
                `
                SELECT 
                    users.user_id,
                    users.username,
                    users.email,
                    users.password,
                    users.role,
                    profiles.avatar_url
                FROM users
                LEFT JOIN profiles 
                    ON profiles.user_id = users.user_id
                WHERE users.email = ?
            `
                , [email]);

            if (rows.length === 0) {
                socket.emit('signin_result', { success: false, message: 'Email not exist' });
                return;
            }

            const userData = rows[0];

            // 2. Validate password
            const match = await bcrypt.compare(password, userData.password);
            if (!match) {
                socket.emit('signin_result', { success: false, message: 'Invalid credentials' });
                return;
            }

            // 3. Determine primary role and create JWT with profile picture included
            // Try to resolve primary role from user_roles -> roles table; fall back to users.role
            let resolvedRole = userData.role || '';
            try {
                const [roleRows] = await db.query(
                    `SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = ? ORDER BY r.role_level DESC LIMIT 1`,
                    [userData.user_id]
                );
                if (roleRows && roleRows.length > 0 && roleRows[0].role_name) {
                    resolvedRole = roleRows[0].role_name;
                }
            } catch (roleErr) {
                console.warn('Could not resolve user primary role, falling back to users.role', roleErr);
            }

            const login = {
                id: userData.user_id,
                username: userData.username,
                email: userData.email,
                role: resolvedRole,
                avatar_url: userData.avatar_url // <-- IMPORTANT
            };
            const token = jwt.sign(login, process.env.JWT_SECRET);

            // Save session to database (expires in 7 days)
            try {
                await db.query(
                    'INSERT INTO active_sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
                    [userData.user_id, token]
                );
            } catch (sessionErr) {
                console.error('Error creating session:', sessionErr);
                socket.emit('signin_result', { success: false, message: 'Session creation failed' });
                return;
            }

            // 4. Return token to Vue
            socket.emit('signin_result', { success: true, token });
        } catch (err) {
            console.error(err);
            socket.emit('signin_result', { success: false, message: 'Server error ok...' });
        }
    });
}

// to work ES module of this function (see server.js since you cant use both import and require at the same time.) 
module.exports = { SigninAndSignupSocket };
