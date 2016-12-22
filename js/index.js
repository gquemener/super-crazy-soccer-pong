import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, div, h2} from '@cycle/dom';
import soundDriver from './drivers/sound';

function main(sources) {
    const initialPosition = 70;
    const paddleSpeed = 20;

    const keys$ = sources.DOM.select('document').events('keydown');
    const keyA$ = keys$.filter(ev => 'KeyA' === ev.code).mapTo(paddleSpeed);
    const keyS$ = keys$.filter(ev => 'KeyS' === ev.code).mapTo(paddleSpeed * -1);
    const keyJ$ = keys$.filter(ev => 'KeyJ' === ev.code).mapTo(paddleSpeed);
    const keyK$ = keys$.filter(ev => 'KeyK' === ev.code).mapTo(paddleSpeed * -1);
    const left$ = xs.merge(keyA$, keyS$).fold((x, y) => x + y, initialPosition);
    const right$ = xs.merge(keyJ$, keyK$).fold((x, y) => x + y, initialPosition);
    const paddles$ = xs.combine(left$, right$).map((combined) => {
        return {
            left: combined[0],
            right: combined[1],
        };
    });

    const initParty = {
        party: {
            winner: null,
            ended: false,
        },
        paddles: {
            left: 0,
            right: 0,
        },
        ball: {
            x: 150,
            y: 100,
            velX: 1,
            velY: 1
        }
    };
    const game$ = xs.combine(paddles$, xs.periodic(15))
        .map((combine) => combine[0])
        .fold((game, paddles) => {
            game.paddles = paddles;

            if (null !== game.party.winner) {
                game.party.ended = true;
            }

            if (game.ball.x > 305) {
                game.party.winner = 'player1';
                return game;
            }

            if (game.ball.x < 75) {
                game.party.winner = 'player2';
                return game;
            }

            if (game.ball.y >= 180 || game.ball.y < 0) {
                game.ball.velY = game.ball.velY * -1;
            }

            if (75 === game.ball.x && game.ball.y >= paddles.left && game.ball.y <= paddles.left + 50) {
                game.ball.velX = game.ball.velX * -1;
            }

            if (305 === game.ball.x && game.ball.y >= paddles.right && game.ball.y <= paddles.right + 50) {
                game.ball.velX = game.ball.velX * -1;
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
                return div('#playground', {}, [
                    div('.paddle-hand.left'),
                    div('.paddle-hand.right'),
                    div('#paddleA.paddle', { style: { top : game.paddles.left + 'px'} }),
                    div('#paddleB.paddle', { style: { top : game.paddles.right + 'px'} }),
                    div('#ball', { style: { top : game.ball.y + 'px', left: game.ball.x + 'px'} })
                ]);
            }),
        sound: game$
    };

    return sinks;
}

run(main, {
    DOM: makeDOMDriver('#game'),
    sound: soundDriver,
});
