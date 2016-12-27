import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, div, h2} from '@cycle/dom';
import soundDriver from './drivers/sound';
import getRandomArbitrary from './game/utils/random';
import border from './game/sound/border';
import shotLeft from './game/sound/shotLeft';
import shotRight from './game/sound/shotRight';
import score from './game/sound/score';

function main(sources) {
    const initParty = {
        party: {
            winner: null,
            ended: false,
        },
        paddles: {
            left: 70,
            right: 70,
        },
        ball: {
            x: 150,
            y: 100,
            velX: 1,
            velY: 1
        },
        speed: 1,
    };

    const keys$ = sources.DOM.select('document').events('keydown');
    const keyA$ = keys$.filter(ev => 'KeyA' === ev.code).mapTo(1).startWith(0);
    const keyS$ = keys$.filter(ev => 'KeyS' === ev.code).mapTo(-1).startWith(0);
    const keyJ$ = keys$.filter(ev => 'KeyJ' === ev.code).mapTo(1).startWith(0);
    const keyK$ = keys$.filter(ev => 'KeyK' === ev.code).mapTo(-1).startWith(0);
    const left$ = xs.merge(keyA$, keyS$);
    const right$ = xs.merge(keyJ$, keyK$);
    const paddles$ = xs.combine(left$, right$)
        .map((combined) => {
            return {
                left: combined[0],
                right: combined[1],
            };
        });

    function step(timestamp) {
        listener.next();
        window.requestAnimationFrame(step);
    }
    const frame$ = xs.create({
        start: (listener) => {
            let step = (timestamp) => {
                listener.next(timestamp);
                window.requestAnimationFrame(step);
            };
            window.requestAnimationFrame(step);
        },
        stop: () => {}
    });

    const speed$ = xs.periodic(10000).mapTo(1).fold((x, y) => x + y, 1);
    const game$ = xs.combine(paddles$, speed$, frame$)
        .map((combine) => {
            let game = combine[0];
            game.speed = combine[1];

            return game;
        })
        .fold((game, next) => {
            const getNextPaddlePosition = (current, direction, speed) => {
                let next = current + (direction * speed);
                if (next < -16) {
                    return -16;
                }

                if (next > 146) {
                    return 146;
                }

                return next;
            };
            game.paddles = {
                left: getNextPaddlePosition(game.paddles.left, next.left, game.speed),
                right: getNextPaddlePosition(game.paddles.right, next.right, game.speed),
            };
            game.speed = next.speed;

            if (null !== game.party.winner) {
                game.party.ended = true;
                return game;
            }

            if (380 === game.ball.x) {
                game.party.winner = 'player1';
                return game;
            }

            if (0 === game.ball.x) {
                game.party.winner = 'player2';
                return game;
            }

            if (game.ball.y >= 180 || game.ball.y < 0) {
                game.ball.velY = game.ball.velY * -1;
            }

            if (75 === game.ball.x && game.ball.y >= game.paddles.left && game.ball.y <= game.paddles.left + 50) {
                game.ball.velX = game.ball.velX * -1;
                game.ball.velY = game.ball.velY + getRandomArbitrary(-1, 2);
            }

            if (305 === game.ball.x && game.ball.y >= game.paddles.right && game.ball.y <= game.paddles.right + 50) {
                game.ball.velX = game.ball.velX * -1;
                game.ball.velY = game.ball.velY + getRandomArbitrary(-1, 2);
            }

            game.ball.x = game.ball.x + game.ball.velX;
            game.ball.y = game.ball.y + game.ball.velY;

            return game;
        }, initParty)
        .filter(game => !game.party.ended)
    ;

    const sinks = {
        DOM: game$
            .map(game => {
                if (null !== game.party.winner) {
                    return h2('.winner', 'Winner: ' + game.party.winner);
                }
                return div([
                    h2('Level: ' + game.speed),
                    div('#game', {}, [
                        div('#playground', {}, [
                            div('.paddle-hand.left'),
                            div('.paddle-hand.right'),
                            div('#paddleA.paddle', { style: { top : game.paddles.left + 'px'} }),
                            div('#paddleB.paddle', { style: { top : game.paddles.right + 'px'} }),
                            div('#ball', { style: { top : game.ball.y + 'px', left: game.ball.x + 'px'} })
                        ])
                    ])
                ]);
            }),
        sound: xs.merge(
            border(game$),
            shotLeft(game$),
            shotRight(game$),
            score(game$)
        ),
    };

    return sinks;
}

run(main, {
    DOM: makeDOMDriver('#app'),
    sound: soundDriver,
});
