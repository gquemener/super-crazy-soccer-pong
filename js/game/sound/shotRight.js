import sounds from './library';

export default function shotRight(game$) {
    return game$
        .filter(game => 305 === game.ball.x && game.ball.y >= game.paddles.right && game.ball.y <= game.paddles.right + 50)
        .map(() => sounds.shotRight);
}
