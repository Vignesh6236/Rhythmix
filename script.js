let getSongs = async () => {
    let a = await fetch("http://127.0.0.1:5500/assets/Songs/")
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.title.endsWith(".mp3")) {
            songs.push(element.title.split(".mp3")[0]);
        }
    }
    return songs    
}


main = async () => {
    // get list of all songs
    let songs = await getSongs()
    console.log(songs);

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li class="glass4 rounded">
            <img src="assets/Icons/music.svg" alt="music">
            <div class="info">
                <div>${song}</div>
                <div>Song artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="assets/Icons/play.svg" alt="play">
            </div>
        </li>
        `;
    }


    // play the first songs
    let audio = new Audio(songs[0]);
    audio.volume = 0.1;   
    audio.play();



    audio.addEventListener("loadeddata", () => {
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
    });

}

main()



