import sounds from './library';
import getRandomArbitrary from '../utils/random';

export default function border(game$) {
    let borders = sounds.borders;

    return game$
        .filter(game => game.ball.y >= 180 || game.ball.y < 0)
        .map(() => {
            let border = borders.splice(getRandomArbitrary(0, borders.length), 1)[0];
            borders.push(border);

            return border;
        });
}
