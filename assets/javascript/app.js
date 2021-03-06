$(document).ready(function () {
    // declaring global variables
    let trackID = "";
    let artistID = "";
    let artistSearch = "";
    let songSearch = "";
    let songName = "";
    let artistName = "";
    let imageArray = [
        '<img src="assets/images/minneapolis.jpg" class="city" alt="Minneapolis">',
        '<img src="assets/images/houston.jpg" class="city" alt="Houston">',
        '<img src="assets/images/nyc.jpg" class="city" alt="New York City">',
    ]
    $("#search").hide();
    // music search from the main landing page
    $(document).on("click", "#find-music", function () {
        event.preventDefault();
        artistSearch = $("#music-input").val();
        musicSearch();
    })
    //music search from the secondary page
    $(document).on("click", "#find-music2", function () {
        event.preventDefault();
        artistSearch = $("#music-input2").val();
        musicSearch();
    })
    //search function when a song title is submitted
    $(document).on("click", "#songSubmit", function () {
        event.preventDefault();
        songSearch = $("#song-name").val();
        $("#landing").hide();
        $("#search").show();
        $.ajax({
            type: "GET",
            data: {
                apikey: "09b22cab81909924e1542cfdadffe284",
                q_track: songSearch,
                f_artist_id: artistID,
                format: "jsonp",
                callback: "jsonp_callback"
            },
            url: "https://api.musixmatch.com/ws/1.1/track.search?",
            dataType: "jsonp",
            jsonpCallback: 'jsonp_callback',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            }
        }).then(function (response) {
            //code to run if the song title is found
            if (response.message.body.track_list.length > 0) {
                //code to run if the song has lyrics in the database
                if (response.message.body.track_list[0].track.has_lyrics === 1) {
                    trackID = response.message.body.track_list[0].track.track_id;
                    songName = response.message.body.track_list[0].track.track_name;
                    $.ajax({
                        type: "GET",
                        data: {
                            apikey: "09b22cab81909924e1542cfdadffe284",
                            track_id: trackID,
                            format: "jsonp",
                            callback: "jsonp_callback"
                        },
                        url: "https://api.musixmatch.com/ws/1.1/track.lyrics.get?",
                        dataType: "jsonp",
                        jsonpCallback: 'jsonp_callback',
                        contentType: 'application/json',
                        success: function (data) {
                            console.log(data);
                        }
                    }).then(function (response) {
                        $("#lyrics").empty();
                        let lyrics = response.message.body.lyrics.lyrics_body;
                        let lyricsClean = lyrics.split("\n\n");
                        let lyricsLink = response.message.body.lyrics.backlink_url;
                        let title = $("<h4>");
                        title.text(songName);
                        $("#lyrics").append(title);
                        for (i = 0; i < lyricsClean.length; i++) {
                            let newDiv = $("<div>");
                            newDiv.attr("id", "lyricsStanza");
                            let lyricsLine = lyricsClean[i];
                            lyricsLineClean = lyricsLine.split("\n")
                            for (j = 0; j < lyricsLineClean.length; j++) {
                                let newP = $("<p>");
                                newP.attr("id", "lyricsLine")
                                newP.text(lyricsLineClean[j]);
                                newDiv.append(newP);
                            }
                            $("#lyrics").append(newDiv);
                        }
                        let link = $("<a>");
                        link.attr("href", lyricsLink);
                        link.attr("target", "_blank")
                        link.text("Get The Full Lyrics");
                        $("#lyrics").append(link);
                        songSearch = "";
                    })
                }
                //runs if song is found but no lyrics are in database
                else {
                    noLyrics();
                }
            }
            //runs if the song title is not found
            else {
                noLyrics();
            }
        })
    })
    //ticket API function. runs in conjusction with the artist search
    function seatGeakAPI() {
        $("#seatGeek").empty();
        $.ajax({
            type: "GET",
            data: {
                q: artistSearch,
                client_id: "MTIwODk3MjV8MTUzMDIwNDExNy4xNw",
            },
            url: "https://api.seatgeek.com/2/performers?",
            success: function (data) {
                console.log(data);

            }
        }).then(function (response) {
            //elvis easter egg
            if (artistID === 702) {
                let newCard = $("<div>")
                newCard.addClass("col-md-12");
                newCard.addClass("card");
                let newDiv = $("<div>");
                newDiv.addClass("card-body")
                let pName = $("<h6>");
                pName.text("");
                let pEvents = $("<img>");
                pEvents.attr("src", "assets/images/elvis.jpg")
                let footerDiv = $("<div>");
                footerDiv.addClass("card-footer")
                newDiv.append(pName);
                newDiv.append(pEvents);
                newCard.append(newDiv);
                newCard.append(footerDiv);
                $("#seatGeek").append(newCard);
            }
            //if there are no upcoming events, this runs
            else if (response.performers[0].has_upcoming_events === false) {
                let perfName = response.performers[0].name;
                let noShows = $("<div>")
                noShows.addClass("col-md-12");
                noShows.addClass("card");
                let newDiv = $("<div>");
                newDiv.addClass("card-body");
                let pName = $("<h6>");
                pName.text(perfName);
                let pEvents = $("<p>");
                pEvents.text("Sorry! We Did Not Find Any Shows For This Artist!")
                let footerDiv = $("<div>")
                footerDiv.addClass("card-footer");
                newDiv.append(pName)
                newDiv.append(pEvents)
                noShows.append(newDiv)
                noShows.append(footerDiv)
                $("#seatGeek").append(noShows)
            }
            //runs if there are upcoming events
            else {
                for (i = 0; i < 3; i++) {
                    let perfName = response.performers[i].name;
                    let perfEvent = response.performers[i].num_upcoming_events;
                    let tixURL = response.performers[i].url;
                    let newCard = $("<div>")
                    newCard.addClass("col-md-4");
                    newCard.addClass("card");
                    let newDiv = $("<div>");
                    newDiv.addClass("card-body")
                    let pName = $("<h6>");
                    pName.text(perfName);
                    let pEvents = $("<p>");
                    pEvents.text("Upcoming shows: " + perfEvent)
                    let footerDiv = $("<div>");
                    footerDiv.addClass("card-footer")
                    let tixLink = $("<a>");
                    tixLink.attr("href", tixURL);
                    tixLink.attr("target", "_blank");
                    tixLink.text("Check out tickets on SeatGeek!")
                    newCard.append(imageArray[i])
                    newDiv.append(pName);
                    newDiv.append(pEvents);
                    footerDiv.append(tixLink);
                    newCard.append(newDiv);
                    newCard.append(footerDiv);
                    $("#seatGeek").append(newCard);
                }
            }
        })
    }
    //giphyAPI. had issues with other image APIs so went with still images from giphy
    function giphyAPI() {
        var searchURL = "https://api.giphy.com/v1/gifs/search?api_key=rp7qhT7CkMUd9kywGAOxdwbvDyXqOsKb"
        $.ajax({
            url: searchURL,
            method: "GET",
            data: {
                "limit": 20,
                "q": artistSearch,
            }
        }).then(function (response) {
            console.log(response);
            let results = response.data;
            $("#imghere").empty();
            for (var i = 0; i < results.length; i++) {
                // let newDiv = $("<div>");
                // newDiv.attr("id", "newGif");
                let still = results[i].images.fixed_height_small_still.url;
                let newGif = $("<img>");
                newGif.attr("src", still);
                newGif.attr("id", "gif")
                // newDiv.append(newGif);
                $("#imghere").append(newGif);
            };
        });
    };
    //runs when no lyrics are found
    function noLyrics() {
        $("#lyrics").empty();
        let notFound = $("<p>")
        notFound.text("Lyrics not found! Try a differnt song!")
        $("#lyrics").append(notFound);
    }
    //main artist search function
    function musicSearch() {
        $("#landing").hide();
        $("#search").show();
        console.log(artistSearch)
        giphyAPI();
        $("#lyrics").empty();
        $("#wikiInfo").empty();
        //wiki API
        $.ajax({
            url: "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + artistSearch,
            dataType: 'jsonp',
            success: function (data) {
                console.log(data)
                console.log(data[2][0])
                console.log(data[3][0])
            }
        }).then(function (response) {
            for (var i = 0; i < response[2].length; i++) {
                let bandP = $("<p>");
                bandP.text(response[2][i]);
                $("#wikiInfo").append(bandP);
            }
            let newLink = $("<a>");
            newLink.addClass("card-link");
            let link = response[3][0];
            newLink.attr("href", link);
            newLink.attr("target", "_blank")
            newLink.attr("id", "band-page");
            newLink.text(artistName + " Wikipedia Page")
            $("#wikiInfo").append(newLink);
            $("#wikiInfo").append("<br>")
        });
        //musixmatch API
        $.ajax({
            type: "GET",
            data: {
                apikey: "09b22cab81909924e1542cfdadffe284",
                q_artist: artistSearch,
                format: "jsonp",
                callback: "jsonp_callback"
            },
            url: "https://api.musixmatch.com/ws/1.1/artist.search?",
            dataType: "jsonp",
            jsonpCallback: 'jsonp_callback',
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
            }
        }).then(function (response) {
            if (response.message.body.artist_list.length === 0) {
                let alert = $("<p>")
                alert.text("Artist not found! Try again!")
                $("#wikiInfo").prepend(alert);
            }
            else {
                artistID = response.message.body.artist_list[0].artist.artist_id;
                artistName = response.message.body.artist_list[0].artist.artist_name
                $("#artist-name").text(artistName)
                seatGeakAPI();
                artistSearch = "";
                artistName = "";
            }
        })
    }
});
