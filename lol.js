console.log("hello there")
let currSongs = new Audio()

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs =[]
    
    for (let index = 0; index < as.length; index++) {
        const element = as[index]
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split("/songs/")[1])
        }
        
    }

    return songs
}

const playMusic = (track,pause = false)=>{
    // var audio = new Audio("/songs/" + track)
    currSongs.src = "/songs/" + track
    if(!pause){
        currSongs.play()
        play.src="img/pause.svg"
    }   
    
    document.querySelector(".songinfo").innerHTML=`${track.replaceAll("%20", " ").replaceAll("mp3","").split("-")[1]}`
    document.querySelector(".songtime").innerHTML=`00:00/00:00`
}

async function main(){
    
    //get the list of all the songs
    let songs = await getSongs()
    // console.log(songs)
    playMusic(songs[0],true)
    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div class = "hidden"> ${song} </div>
                                <div> ${song.replaceAll("%20", " ").replaceAll("mp3","").split("-")[1]}</div>
                                <div>${song.replaceAll("%20", " ").replaceAll("mp3","").split("-")[0]}</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`
        // console.log(songUL.innerHTML)
    }
    //Attack an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })    

    })
    //attach an event listner to play, next and previous
    play.addEventListener("click",()=>{
        if(currSongs.paused){
            currSongs.play()
            play.src="img/pause.svg"
        }else{
            currSongs.pause()
            play.src="img/play.svg"
        }
    })
    //listen for timeupdate event
    currSongs.addEventListener("timeupdate",()=>{
        console.log(currSongs.currentTime,currSongs.duration)
        document.querySelector(".songtime").innerHTML  = `${secondsToMinutesSeconds(currSongs.currentTime)}/${secondsToMinutesSeconds(currSongs.duration)}`
        document.querySelector(".circle").style.left = ((currSongs.currentTime)/(currSongs.duration))*100 + "%"
    })
    //Add an event lisnter to the seek bar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        // console.log(e.target.getBoundingClientRect().width,e.offsetX)
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent +"%"
        currSongs.currentTime = ((currSongs.duration)*percent)/100
    })
    //Add event listern to previous 
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currSongs.src.split("/").slice(-1)[0])
        console.log(index)
        if((index+1) >= 0){
            playMusic(songs[index+1])
        }
        
    })

    //Add event listern to next
    next.addEventListener("click",()=>{
        let index = songs.indexOf(currSongs.src.split("/").slice(-1)[0])
        console.log(index)
        if((index+1) < (songs.length )){
            playMusic(songs[index+1])
        }
        
    })
    //add an event for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",e=>{
        console.log(e,e.target.value)
        //currsongs volume the value is from 0 to 1
        currSongs.volume = parseInt(e.target.value)/100
    })

    
}
main()
