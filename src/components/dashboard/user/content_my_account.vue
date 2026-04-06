<script>
    import ProfilePic from '../../profile-pic.vue';
    import ButtonTxt from '../../button-text.vue';
    import PlayerStatLevel from '../../player-stat-level.vue';
    import PlayerStatDuelPoint from '../../player-stat-duel-point.vue';
    import ScoreLabel from '../../score-label.vue';
    export default{
        components:{
            ProfilePic,
            ButtonTxt,
            PlayerStatLevel,
            PlayerStatDuelPoint,
            ScoreLabel
        },
        emits: ['edit']
    }
</script>
<template>
    <div>
        <div class="row row-account">
            <div class="col">
                <ProfilePic
                    :img-src=user_profile_pic
                />
            </div>
            <div class="col row row-account-detail">
                <div class="col">
                    <h1 class="display-2 fw-bolder">{{user_full_name}}</h1>
                    <p>{{user_email}}</p>
                </div>
                <div class="col">
                    <ButtonTxt
                        title="Edit"
                        alt-text="edit_account_button"
                        @click="$emit('edit')"
                    />
                </div>
            </div>
        </div>
    </div>
    <hr>
    <div>
        <h2>Your Statistics</h2>
        <div class="row row-statistics">
            <div class="col row row-level-and-duelpoints">
                <div class="col">
                    <h4>Level</h4>
                    <PlayerStatLevel
                        :size=250
                        :level=user_statistic_level
                        :current-exp=user_statistic_level_xp
                        :max-exp=1000
                    />
                </div>
                <div class="col">
                    <h4>Duel Points</h4>
                    <PlayerStatDuelPoint
                        :size=200
                        :points=user_statistic_duel_point
                    />
                </div>
            </div>
            <div class="container col row row-player-brief-stat">
                <div class="col">
                    <ScoreLabel
                        title="788th"
                        subtitle="Ranking"
                    />
                </div>
                <div class="col">
                    <ScoreLabel
                    title="0"
                    subtitle="Win streaks"
                    />
                </div>
                <div class="col">
                    <ScoreLabel
                    title="100%"
                    subtitle="Win rate"
                    />
                </div>
                <div class="col">
                    <ScoreLabel
                    title="389,112"
                    subtitle="Duel points"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    const props = defineProps({
        user_profile_pic:{
            type: String
        },
        user_full_name:{
            type: String
        },
        user_email:{
            type: String
        },
        user_statistic_level:{
            type: Number
        },
        user_statistic_level_xp:{
            type: Number
        },
        user_statistic_duel_point:{
            type: Number
        }
    });
</script>
