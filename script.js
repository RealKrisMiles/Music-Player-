let currSongs = new Audio();
let songs;
let currfolder;

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

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div class="hidden"> ${song} </div>
                    <div> ${song.replaceAll("%20", " ").replaceAll("mp3", "").split("-")[1]}</div>
                    <div>${song.replaceAll("%20", " ").replaceAll("mp3", "").split("-")[0]}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    currSongs.src = `/${currfolder}/` + track;
    if (!pause) {
        currSongs.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = `${track.replaceAll("%20", " ").replaceAll("mp3", "").split("-")[1]}`;
    document.querySelector(".songtime").innerHTML = `00:00/00:00`;
}

async function displayAlbums() {
    try {
        // Fetch the list of directories in the songs folder
        let response = await fetch(`/songs/`);
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear any existing content

        // Iterate through the directory links
        for (let anchor of anchors) {
            let folder = anchor.href.split("/").slice(-2)[1];
            if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
                try {
                    // Fetch the info.json for each album folder
                    let albumResponse = await fetch(`/songs/${folder}/info.json`);
                    let albumInfo = await albumResponse.json();

                    // Append the album card to the container
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpeg" alt="">
                            <h2>${albumInfo.title}</h2>
                            <p>${albumInfo.description}</p>
                        </div>`;
                } catch (error) {
                    console.error(`Error fetching info for folder ${folder}:`, error);
                }
            }
        }

        // Add event listeners to the album cards
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async event => {
                console.log("Fetching Songs");
                await getSongs(`songs/${event.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    } catch (error) {
        console.error('Error fetching albums:', error);
    }
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/keshi");

    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    // Attach event listeners to play, next, and previous
    play.addEventListener("click", () => {
        if (currSongs.paused) {
            currSongs.play();
            play.src = "img/pause.svg";
        } else {
            currSongs.pause();
            play.src = "img/play.svg";
        }
    });

    // Listen for the timeupdate event
    currSongs.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currSongs.currentTime)}/${secondsToMinutesSeconds(currSongs.duration)}`;
        document.querySelector(".circle").style.left = ((currSongs.currentTime) / (currSongs.duration)) * 100 + "%";
    });

    // Add an event listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSongs.currentTime = ((currSongs.duration) * percent) / 100;
    });

    // Add event listener to previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currSongs.src.split("/").slice(-1)[0]);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Add event listener to next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currSongs.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    // Add event listener for volume control
    document.querySelector(".range input").addEventListener("change", e => {
        currSongs.volume = parseInt(e.target.value) / 100;
    });

    // Add event listener to mute/unmute the track
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currSongs.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currSongs.volume = 1.0;
            document.querySelector(".range input").value = 100;
        }
    });

    // Add event listener for the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add event listener for the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
