export default function soundDriver(sound$) {
    sound$.addListener({
        next: sound => {
            sound.currentTime = 0;
            sound.play();
        }
    });
}
