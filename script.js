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
            
            let decodedTitle = decodeURIComponent(element.title);
            songs.push(decodedTitle);
        }
    }
    return songs;
}

let currentSong = new Audio();

const playMusic = (track) => {
    // let audio = new Audio(track);
    currentSong.src = track;
    currentSong.volume = 0.2;
    currentSong.play();
};



main = async () => {
    

    // Get list of all songs
    let songs = await getSongs();

    // Show all songs
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const song of songs) {
        let songInfo = song.split(".mp3")[0];
        let songArtist = songInfo.split("-")[0].trim();
        let songName = songInfo.split("-")[1].trim();
        songUL.innerHTML += `
        <li class="glass4 rounded">
            <img src="assets/Icons/music.svg" alt="music">
            <div class="info">
                <div>${songName}</div>
                <div>${songArtist}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="assets/Icons/play.svg" alt="play">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            let songArtist = e.querySelector(".info").lastElementChild.innerHTML.trim();
            // Encode the URL for any spaces or special characters
            let track = `http://127.0.0.1:5500/assets/Songs/${encodeURIComponent(songArtist)}-%20${encodeURIComponent(songName)}.mp3`;
            playMusic(track);
        });
    });
};


main();
