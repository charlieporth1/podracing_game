// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
    track_id: undefined,
    player_id: undefined,
    race_id: undefined,
};
const updateStore = async (oldStore, newState) => {
    console.log("store updated");
    store = Object.assign(oldStore, newState);
};
// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
    onPageLoad().then().catch().finally();
    setupClickHandlers()
});

async function onPageLoad() {
    try {
        getTracks()
            .then(tracks => {
                const html = renderTrackCards(tracks);
                renderAt('#tracks', html)
            }).catch((e)=> console.error(e));

        getRacers()
            .then((racers) => {
                const html = renderRacerCars(racers);
                renderAt('#racers', html)
            }).catch((e)=> console.error(e))
    } catch (error) {
        console.log("Problem getting tracks and racers ::", error.message);
        console.error(error)
    }
}

function setupClickHandlers() {
    document.body.addEventListener('click', async function (event) {
        const {target} = event;
        if (target) {
            // Race track form field
            if (target.closest('.card.track')) {
                await handleSelectTrack(target).catch((e)=> console.error(e))
            }

            // Podracer form field
            if (target.closest('.card.podracer')) {
                await handleSelectPodRacer(target).catch((e)=> console.error(e))
            }

            // Submit create race form
            if (target.closest('#submit-create-race')) {
                event.preventDefault();

                // start race
                handleCreateRace().then().catch().finally();
            }

            // Handle acceleration click
            if (target.closest('#gas-peddle')) {
                await handleAccelerate(target).catch((e)=> console.error(e))
            }
        }
    }, false)
}

async function delay(ms) {
    try {
        return await new Promise(resolve => setTimeout(resolve, ms));
    } catch (error) {
        console.log("an error shouldn't be possible here");
        console.log(error)
    }
}

// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
    // render starting UI
    let {player_id, track_id, race_id} = store;
    createRace(player_id, track_id).then(async (data) => {
        race_id = data.ID - 1;
        const race = await getRace(race_id);
        await updateStore(store, {race_id});
        console.log(race);
        renderAt('#race', renderRaceStartView(data));
        if (!race_id)
            await updateStore(store, {race_id});
        // The race has been created, now start the countdown
        // TODO - call the async function runCountdown
        await runCountdown().then().catch(e => console.error(e));
        // TODO - call the async function startRace
        await startRace(race_id).then(async (data) => {
            console.log(data);
            runRace(race_id);


        }).catch((err) => {
            console.error(err)
        });
    }).catch((err) => {
        console.error(err);
    });


    // TODO renderAt('#race', renderRaceStartView(data)); - Get player_id and track_id from the store

    // const race = TODO - invoke the API call to create the race, then save the result

    // TODO - update the store with the race id

    // TODO - call the async function runRace
}

function runRace(raceID) {
    return new Promise(async resolve => {
        const res = await getRace(raceID).catch((e)=> console.error(e));
        // TODO - use Javascript's built in setInterval method to get race info every 500ms
        const raceInterval = setInterval( async () => {
            const res = (await getRace(raceID).catch((e)=> console.error(e)));
            renderAt('#leaderBoard', raceProgress(res.positions));
            if (res.status === 'finished') {
                renderAt('#race', resultsView(res.positions));
                clearInterval(raceInterval);
                resolve(res);
            }
        }, 500);
        /*
            TODO - if the race info status property is "in-progress", update the leaderboard by calling:

            // renderAt('#leaderBoard', raceProgress(res.positions))
        */
        /*
            TODO - if the race info status property is "finished", run the following:

            clearInterval(raceInterval) // to stop the interval from repeating
            renderAt('#race', resultsView(res.positions)) // to render the results view
            reslove(res) // resolve the promise
        */

    })
    // remember to add error handling for the Promise
}

async function runCountdown() {
    try {
        // wait for the DOM to load
        await delay(1000).catch((e)=> console.error(e));
        let timer = 3;

        return new Promise(resolve => {
            // TODO - use Javascript's built in setInterval method to count down once per second
            const iTimer = setInterval(() => {
                // run this DOM manipulation to decrement the countdown for the user
                document.getElementById('big-numbers').innerHTML = --timer + "";

                // TODO - if the countdown is done, clear the interval, resolve the promise, and return
                if (timer <= 0) {
                    return resolve(clearInterval(iTimer));
                }


            }, 1000);
        }).catch((e)=> console.error(e));
    } catch (error) {
        console.log(error);
    }
}

async function backgroundTask(data) {
    return new Promise(resolve => {
        if (typeof data === "function") {
            data();
            resolve(true)
        } else {
            throw Error("Not a function");
        }
    }).catch((e)=> console.error(e));
}

//Replaces non number digits plus neg and decimal points
const replaceNonNumber = (str) => {
    return parseInt(str.replace(/[^\d.-]/g, ''));
};

async function handleSelectPodRacer(target) {
    console.log("selected a pod", target.id);
    // remove class selected from all racer options
    const id = replaceNonNumber(target.id);

    const task = backgroundTask(async () => {
        const selected = document.querySelector('#racers .selected');
        if (selected) {
            selected.classList.remove('selected');
        }
    }).catch((e)=> console.error(e));

    // add class selected to current target
    target.classList.add('selected');

    const player_id = id;
    await updateStore(store, {player_id}).catch((e)=> console.error(e));
}

async function handleSelectTrack(target) {
    console.log("selected a track", target.id);
    const id = replaceNonNumber(target.id);
    // remove class selected from all track options
    const task = backgroundTask(async () => {
        const selected = document.querySelector('#tracks .selected');
        if (selected) {
            selected.classList.remove('selected')
        }
    }).catch((e)=> console.error(e));
    // add class selected to current target
    target.classList.add('selected');


    const track_id = id;
    await updateStore(store, {track_id}).catch((e)=> console.error(e));

}

async function handleAccelerate() {
    console.log("accelerate button clicked");
    // TODO - Invoke the API call to accelerate
    // const race = await getRace(store.race_id);
    await accelerate(store.race_id).catch((e)=> console.error(e));

}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
    if (!racers.length) {
        return `
			<h4>Loading Racers\...</h4>
		`
    }

    const results = racers.map(renderRacerCard).join('');

    return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
    const {id, driver_name, top_speed, acceleration, handling} = racer;

    return `
		<li class="card podracer" id="${id}">
			<h3 id="${"a" + id}">Driver: ${driver_name}</h3>
			<p id="${"b" + id}">Top Speed: ${top_speed}</p>
			<p id="${"c" + id}">Acceleration: ${acceleration}</p>
			<p id="${"d" + id}">Handling: ${handling}</p>
			</div>
		</li>
	`
}

function renderTrackCards(tracks) {
    if (!tracks.length) {
        return `
			<h4>Loading Tracks...</h4>
		`
    }

    const results = tracks.map(renderTrackCard).join('');

    return `
		<ul id="tracks">
		     ${results}
		</ul>
	`
}

function renderTrackCard(track) {
    const {id, name} = track;

    return `
		<li id="${id}" class="card track">
			<h3 id="${"a" + id}">${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
    return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
    return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
    positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1);

    return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
    let userPlayer = positions.find(e => e.id === store.player_id);
    userPlayer.driver_name += " (you)";

    positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1);
    let count = 1;

    const results = positions.map(p => {
        return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
    }).join('');

    return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
    const node = document.querySelector(element);
    node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
    return {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': SERVER,
        },
    }
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
    // GET request to `${SERVER}/api/tracks`
    return await new Promise(resolve => {
        fetch(`${SERVER}/api/tracks`, {
            method: 'GET',
            ...defaultFetchOpts()
        }).then(async res => {
            const data = await res.json();
            return resolve(data);
        }).catch(err => {
            console.error(err);
            return Promise.reject(err);
        });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })
}

async function getRacers() {
    // GET request to `${SERVER}/api/cars`
    return await new Promise(resolve => {
        fetch(`${SERVER}/api/cars`, {
            method: 'GET',
            ...defaultFetchOpts()
        }).then(async res => {
            const data = await res.json();
            return resolve(data);
        }).catch(err => {
            console.error(err);
            return Promise.reject(err);
        });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })
}

async function createRace(player_id, track_id) {
    player_id = parseInt(player_id);
    track_id = parseInt(track_id);
    const body = {player_id, track_id};
    return await new Promise(resolve => {
        return fetch(`${SERVER}/api/races`, {
            method: 'POST',
            ...defaultFetchOpts(),
            dataType: 'jsonp',
            body: JSON.stringify(body)
        })
            .then(async res => resolve(await res.json()))
            .catch(err => {
                console.error("Problem with createRace request:: ", err);
                return Promise.reject(err);
            });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })
}

async function getRace(id) {
    // GET request to `${SERVER}/api/races/${id}`
    return await new Promise(resolve => {
        return fetch(`${SERVER}/api/races/${id}`, {
            method: 'GET',
            ...defaultFetchOpts()
        })
            .then( res => resolve( res.json()))
            .catch(err => {
                console.log("Problem with getRace request:: ", err);
                return Promise.reject(err);
            });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })

}

async function startRace(id) {
    return await new Promise(resolve => {
        return fetch(`${SERVER}/api/races/${id}/start`, {
            method: 'POST',
            ...defaultFetchOpts(),
        })
            .then(res => resolve(res))
            .catch(err => {
                console.log("Problem with startRace request::", err);
                return Promise.reject(err);
            });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })
}

async function accelerate(id) {
    return await new Promise(resolve => {
        // POST request to `${SERVER}/api/races/${id}/accelerate`
        // options parameter provided as defaultFetchOpts
        // no body or datatype needed for this request
        return fetch(`${SERVER}/api/races/${id}/accelerate`, {
            method: 'POST',
            ...defaultFetchOpts(),
        })
            .then(res => resolve(res))
            .catch(err => {
                console.log("Problem with startRace request::", err);
                return Promise.reject(err);
            });
    }).catch((err) => {
        console.error("Promise error ", err);
        return Promise.reject(err)
    })
}
