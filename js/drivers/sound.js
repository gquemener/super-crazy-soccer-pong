export default function sound(game$) {
    let borders = [
        new Audio('sounds/border_1.wav'),
        new Audio('sounds/border_2.wav'),
        new Audio('sounds/border_3.wav'),
        new Audio('sounds/border_4.wav'),
        new Audio('sounds/border_5.wav'),
    ];
    let shotLeft = new Audio('sounds/shot_left.wav');
    let shotRight = new Audio('sounds/shot_right.wav');
    let score = new Audio('sounds/score.wav');

    const play = (audio) => {
        audio.currentTime = 0;
        audio.play();
    }
    const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;

    game$.addListener({ next: game => {
        let paddles = game[0];
        let ball = game[1];

        if (null !== game.party.winner) {
            play(score);
        }

        if (game.ball.y >= 180 || game.ball.y < 0) {
            let border = borders.splice(getRandomArbitrary(0, borders.length), 1)[0];
            play(border);
            borders.push(border);
        }

        if (75 === game.ball.x && game.ball.y >= game.paddles.left && game.ball.y <= game.paddles.left + 50) {
            play(shotLeft);
        }

        if (305 === game.ball.x && game.ball.y >= game.paddles.right && game.ball.y <= game.paddles.right + 50) {
            play(shotRight);
        }
    }});
}
