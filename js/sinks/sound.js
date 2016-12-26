import xs from 'xstream';
import getRandomArbitrary from '../utils/random';

export default function soundSink(game$) {
    let sounds = {
        borders: [
            new Audio('sounds/border_1.wav'),
            new Audio('sounds/border_2.wav'),
            new Audio('sounds/border_3.wav'),
            new Audio('sounds/border_4.wav'),
            new Audio('sounds/border_5.wav'),
        ],
        shotLeft: new Audio('sounds/shot_left.wav'),
        shotRight: new Audio('sounds/shot_right.wav'),
        score: new Audio('sounds/score.wav'),
    };

    const border$ = game$
        .filter(game => game.ball.y >= 180 || game.ball.y < 0)
        .map(() => {
            let border = sounds.borders.splice(getRandomArbitrary(0, sounds.borders.length), 1)[0];
            sounds.borders.push(border);

            return border;
        });
    const shotLeft$ = game$
        .filter(game => 75 === game.ball.x && game.ball.y >= game.paddles.left && game.ball.y <= game.paddles.left + 50)
        .map(() => sounds.shotLeft);

    const shotRight$ = game$
        .filter(game => 305 === game.ball.x && game.ball.y >= game.paddles.right && game.ball.y <= game.paddles.right + 50)
        .map(() => sounds.shotRight);

    const score$ = game$
        .filter((game) => null !== game.party.winner)
        .map(() => sounds.score);

    return xs.merge(border$, shotLeft$, shotRight$, score$);
}
