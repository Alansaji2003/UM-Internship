// Import needed modules from Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore-lite.js';
import { getStorage, ref, listAll, getDownloadURL, uploadString, uploadBytes } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js';

// Elements to be used
const colors = ['#FFDB00', '#FF8F00', "#050C9C", "#E88D67", "#D10363"];
const ul = document.querySelector(".library ul");
const addForm = document.querySelector(".addForm");
const addButton = document.querySelector(".library button");
const createButton = document.querySelector(".addForm .create");
const cancelButton = document.querySelector(".addForm .cancel");
const cardContainer = document.querySelector(".cardContainer");
const cards = document.querySelectorAll('.symphonyPlaylist .card');
const searchicon1 = document.querySelector(".searchicon1");
const searchicon2 = document.querySelector(".searchicon2");
const load = document.querySelector(".loading");
const playButton = document.querySelector("#playButton");
const loadSong = document.querySelector(".loadSongs");
const addSongButton = document.querySelector(".addSongButton");
const volumeSlider = document.getElementById('myRange');
const nextSong = document.querySelector(".next-song");
const prevSong = document.querySelector(".prev-song");
const searchInput = document.querySelector(".searchInput");
let currentAudio = new Audio(); // Single global audio element to play songs
let currentPlaylistName = ""; // Global variable to keep track of the current playlist

// Hover effect and click for pre-existing cards
cards.forEach(card => {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    card.style.backgroundColor = randomColor;
    addPlaylistOnLeft(card);
    addHoverEffect(card);
    handleClick(card);
});

// Populate playlist lists on the left side
function addPlaylistOnLeft(card) {
    const li = document.createElement("li");
    li.innerHTML = card.querySelector("h2").textContent;
    ul.appendChild(li);
    // Click event for each playlist
    li.addEventListener("click", () => {
        cardContainer.classList.add("hidden");
        const openPlaylist = document.querySelector(".openPlaylist");
        openPlaylist.classList.remove("hidden");
        const h2 = openPlaylist.querySelector("h2");
        h2.textContent = card.querySelector("h2").textContent;
        // Fetch and display songs
        fetchAndDisplaySongs(card.querySelector("h2").textContent);
    });
}

//Firebase configuration
const firebaseConfig = {
   // Your web app's Firebase configuration
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to handle mouseover and mouseout animations on new playlists
function addHoverEffect(card) {
    const svg = card.querySelector('svg');
    card.addEventListener('mouseover', () => {
        svg.style.top = '100px';
        svg.style.opacity = '1';
    });
    card.addEventListener('mouseout', () => {
        svg.style.top = '150px';
        svg.style.opacity = '0';
    });
}

// Handle click to open each playlist
function handleClick(card) {
    card.addEventListener('click', async () => {
        cardContainer.classList.add("hidden");
        const openPlaylist = document.querySelector(".openPlaylist");
        openPlaylist.classList.remove("hidden");
        const h2 = openPlaylist.querySelector("h2");
        h2.textContent = card.querySelector("h2").textContent;
        // Fetch and display songs
        await fetchAndDisplaySongs(card.querySelector("h2").textContent);
    });
}

// Function to add playlist to UI
function addPlaylistToUI(name, id, imageUrl) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = id;

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    card.style.backgroundColor = randomColor;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "48");
    svg.setAttribute("height", "48");
    svg.setAttribute("color", "#a300ff");
    svg.setAttribute("fill", "none");
    svg.innerHTML = `
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3.5" fill="currentColor" />
        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black" />
    `;
    card.appendChild(svg);

    const img = document.createElement("img");
    img.src = imageUrl;
    card.appendChild(img);

    const h2 = document.createElement("h2");
    h2.textContent = name;
    card.appendChild(h2);

    const p = document.createElement("p");
    p.textContent = "Custom Playlist";
    card.appendChild(p);

    cardContainer.appendChild(card);
    addPlaylistOnLeft(card);
    addHoverEffect(card);
    handleClick(card);
}

// Event listeners for add, create, and cancel buttons
addButton.addEventListener("click", () => {
    addForm.classList.remove("hidden");
});

cancelButton.addEventListener("click", () => {
    addForm.classList.add("hidden");
});

// Create new playlist on Firebase Firestore
createButton.addEventListener("click", async () => {
    const input = document.querySelector(".addForm input");
    const inputValue = input.value;
    if (inputValue) {
        try {
            load.classList.remove("hidden");
            const response = await fetch(`https://picsum.photos/seed/${inputValue}/200/200`);
            const imageUrl = response.url;

            // Create new playlist document in Firestore
            const playlistRef = await addDoc(collection(db, 'playlists'), {
                name: inputValue,
                image: imageUrl,
                createdAt: serverTimestamp()
            });

            // Create new folder in Firebase Storage
            const newFolderRef = ref(storage, inputValue + '/');

            // Firebase Storage does not actually create empty folders. 
            // To create a new folder, upload a placeholder file in the new folder.
            const placeholderFileRef = ref(newFolderRef, 'placeholder.txt');
            await uploadString(placeholderFileRef, 'This is a placeholder file to create the folder.');

            load.classList.add("hidden");
            addPlaylistToUI(inputValue, playlistRef.id, imageUrl);
            addForm.classList.add("hidden");
        } catch (error) {
            console.log('Error creating playlist:', error);
            load.classList.add("hidden"); // Hide loading spinner in case of error
        }
    }
});


// Fetch and display songs from Firebase Storage
async function fetchAndDisplaySongs(playlistName) {
    setCurrentPlaylist(playlistName);
    const songsRef = ref(storage, playlistName);
    const ulopen = document.querySelector(".openPlaylist ul");
    ulopen.innerHTML = '';

    // Stop any currently playing song
    // currentAudio.pause();
    // currentAudio.src = '';

    try {
        loadSong.classList.remove("hidden");
        const songsSnapshot = await listAll(songsRef);
        const songPromises = songsSnapshot.items.map(async (songRef) => {
            const songUrl = await getDownloadURL(songRef);
            displaySong(songRef.name, songUrl);
        });

        await Promise.all(songPromises);
        loadSong.classList.add("hidden");
        handleSongClick();
    } catch (error) {
        console.log('Error fetching songs:', error);
    }
}

// Display song on the UI
function displaySong(name, url) {
    // Ignore the placeholder file of new empty playlist made in storage
    if (name === 'placeholder.txt') {
        return;
    }

    const li = document.createElement("li");
    li.textContent = name;
    const ulopen = document.querySelector(".openPlaylist ul");
    li.dataset.url = url; // Store the URL in a data attribute
    ulopen.appendChild(li);
}


// Check if any song is playing
function isAnySongPlaying() {
    return !currentAudio.paused;
}

// Handle song click on each playlist
function handleSongClick() {
    const songs = document.querySelectorAll(".openPlaylist li");
    
    songs.forEach(song => {
        song.addEventListener("click", () => {
            const songUrl = song.dataset.url;

            if (currentAudio.src !== songUrl) {
                currentAudio.src = songUrl;
                currentAudio.play();
                
                playButton.src = "/images/playbar/pause.svg";
                document.querySelector(".songInfo .scrolling-text").innerHTML = song.textContent;
                document.querySelector(".songTime").innerHTML = "0:00/0:00";
                getTimestamp();
            } else {
                if (currentAudio.paused) {
                    currentAudio.play();
                    playButton.src = "/images/playbar/pause.svg";
                } else {
                    currentAudio.pause();
                    playButton.src = "/images/playbar/play.svg";
                }
            }

            // Update playing status
            document.querySelectorAll(".openPlaylist li").forEach(li => li.classList.remove("playing"));
            song.classList.toggle('playing', !currentAudio.paused);
        });
    });
}



// Event listener for back button
document.querySelectorAll(".prev").forEach(button => {
    button.addEventListener("click", () => {
        const openPlaylist = document.querySelector(".openPlaylist");
        openPlaylist.classList.add("hidden");
        cardContainer.classList.remove("hidden");
    });
});

// Search icons click
function handleSearchClick() {
    const searchInput = document.querySelector(".searchInput");
    searchInput.classList.toggle("hidden");
}

searchicon1.addEventListener("click", () => {
    handleSearchClick();
});

searchicon2.addEventListener("click", () => {
    handleSearchClick();
});

playButton.addEventListener("click", () => {
    if (isAnySongPlaying()) {
        currentAudio.pause();
        document.querySelector(".openPlaylist li.playing")?.classList.remove("playing");
        playButton.src = "/images/playbar/play.svg";
    } else {
        currentAudio.play();
        document.querySelector(".openPlaylist li.playing")?.classList.add("playing");
        playButton.src = "/images/playbar/pause.svg";
        getTimestamp();
    }
});

// Function to get timestamp of the song
function getTimestamp() {
    currentAudio.addEventListener("timeupdate", () => {
        const currentTime = currentAudio.currentTime;
        let duration = currentAudio.duration;
        duration = Math.floor(duration / 60) + ':' + Math.floor(duration % 60);
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const songTime = document.querySelector(".songTime");
        songTime.innerHTML = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}/${duration}`;
        document.querySelector(".seekCircle").style.left = `${(currentTime / currentAudio.duration) * 98}%`;
    });
}

// Event listener for seek bar
document.querySelector(".seekbar").addEventListener("click", (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    currentAudio.currentTime = (percentage / 100) * currentAudio.duration;
    document.querySelector(".seekCircle").style.left = `${percentage}%`;
});


// Event listener for add song button
addSongButton.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    document.querySelector(".close").style.display = "none";
    const addSongForm = document.querySelector(".addSongForm");
    addSongForm.classList.toggle("hidden");
});



// Function to set the current playlist name (this is called when a playlist is selected)
function setCurrentPlaylist(name) {
    currentPlaylistName = name;
}
// Handle file upload
document.querySelector(".addSong").addEventListener("click", async () => {
    
    const fileInput = document.querySelector("#file");
    const files = fileInput.files;
    const loadingImg = loadSong;
    if (!currentPlaylistName) {
        alert("Please select a playlist first.");
        return;
    }

    if (files.length > 0) {
        loadingImg.classList.remove("hidden");

        try {
            for (let file of files) {
                const storageRef = ref(storage, `${currentPlaylistName}/${file.name}`);
                await uploadBytes(storageRef, file);
                console.log(`${file.name} uploaded successfully to ${currentPlaylistName} folder.`);
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            loadingImg.classList.add("hidden");
            fileInput.value = ''; // Clear the file input
            fetchAndDisplaySongs(currentPlaylistName);
            document.querySelector(".addSongForm").classList.add("hidden");
        }
    } else {
        alert("Please select at least one audio file to upload.");
    }
});

// Handle cancel button
document.querySelector(".cancel-song").addEventListener("click", () => {
    document.querySelector(".addSongForm").classList.add("hidden");
});

//event listener for hamburger menu
document.querySelector(".ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
    document.querySelector(".close").style.display = "inline-block";
});

//event listener for close button
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
    document.querySelector(".close").style.display = "none";
});

function updateVolume() {
    // Get the slider value and convert it to a range of 0 to 1
    const volume = volumeSlider.value / 100;
    // Set the audio element's volume
    currentAudio.volume = volume;
}
volumeSlider.addEventListener('input', updateVolume);
updateVolume();


// Event listener for search input , inside the playlist
searchInput.addEventListener("input", () => {
    const songs = document.querySelectorAll(".openPlaylist li");
    const searchValue = searchInput.value.toLowerCase();
    songs.forEach(song => {
        const songName = song.textContent.toLowerCase();
        if (songName.includes(searchValue)) {
            song.style.display = "block";
        } else {
            song.style.display = "none";
        }
    });
})

// Fetch and display playlists
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'playlists'));
        querySnapshot.forEach(doc => {
            const playlist = doc.data();
            addPlaylistToUI(playlist.name, doc.id, playlist.image);
        });
    } catch (error) {
        console.log('Error getting playlists:', error);
    }
    // Event listener for next song
nextSong.addEventListener("click", () => {
    const songs = document.querySelectorAll(".openPlaylist li");
    const currentSong = document.querySelector(".openPlaylist li.playing");
    let nextSong = currentSong.nextElementSibling;
    if (!nextSong) {
        nextSong = songs[0];
    }
    currentAudio.src = nextSong.dataset.url;
    currentAudio.play();
    document.querySelector(".songInfo .scrolling-text").innerHTML = nextSong.textContent;
    document.querySelector(".songTime").innerHTML = "0:00/0:00";
    getTimestamp();
    document.querySelectorAll(".openPlaylist li").forEach(li => li.classList.remove("playing"));
    nextSong.classList.add("playing");
});
// Event listener for previous song

prevSong.addEventListener("click", () => {
    const songs = document.querySelectorAll(".openPlaylist li");
    const currentSong = document.querySelector(".openPlaylist li.playing");
    let prevSong = currentSong.previousElementSibling;
    if (!prevSong) {
        prevSong = songs[songs.length - 1];
    }
    currentAudio.src = prevSong.dataset.url;
    currentAudio.play();
    document.querySelector(".songInfo .scrolling-text").innerHTML = prevSong.textContent;
    document.querySelector(".songTime").innerHTML = "0:00/0:00";
    getTimestamp();
    document.querySelectorAll(".openPlaylist li").forEach(li => li.classList.remove("playing"));
    prevSong.classList.add("playing");

})
});