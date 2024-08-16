let getSongs = async () =>{
    let a = await fetch("http://127.0.0.1:5500/assets/Songs/")
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div")
    div.innerHTML= response;
    let as = div.getElementsByTagName("a")
    
    let songs=[]
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.title.endsWith(".mp3")){
            songs.push(element.title)
        }
    }
    return songs
}






 main = async () =>{
    let songs = await getSongs()
    console.log(songs);

}

main()



