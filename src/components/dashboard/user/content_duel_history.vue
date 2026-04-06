<script>
    import ScrollVerticalCarousel from '../../scroll-vertical-carousel.vue';
    import ScrollCard from '../../scroll-card.vue';
    import CardHistoryMatch from '../../card-history-match.vue';
    
    export default{
        components:{
            ScrollVerticalCarousel,
            ScrollCard,
            CardHistoryMatch
        }
    }

    
</script>
<template>
    <div>
        <ScrollVerticalCarousel>
            <ScrollCard>
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="WON"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="LOSS"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="LOSS"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="LOSS"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="LOSS"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="WON"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
                <CardHistoryMatch
                    -player1-name="Player 1"
                    -player2-name="Player 2"
                    -match-result="LOSS"
                    -match-duration="9:10"
                    -match-date="12/06/25"
                />
            </ScrollCard>
        </ScrollVerticalCarousel>
    </div>
</template>
