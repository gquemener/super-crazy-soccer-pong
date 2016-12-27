import sounds from './library';

export default function shotLeft(game$) {
    return game$
        .filter(game => 75 === game.ball.x && game.ball.y >= game.paddles.left && game.ball.y <= game.paddles.left + 50)
        .map(() => sounds.shotLeft);
}
