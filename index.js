const reader = require("readline-sync")
const dotenv = require("dotenv")
dotenv.config()
// Gets information from the user and stores it into a dictionary.

// function getInformationFromUser() {
//     let playListName = reader.question("Enter the name for the playlist")
//     let link = reader.question("Enter the link for the playlist")

//     console.log("Pleae enter your spotify credentials")
//     console.warn(
//         "This information is not stored anywhere and is only used to create the playlist"
//     )

//     // Spotify login and error checking
//     let spotifyEmail = reader.question("Enter your spotify email/Username")
//     let spotifyPassword = reader.question("Enter your spotify password", {
//         hideEchoBack: true,
//     })
//     let spotifyVerify
//     spotifyVerify = reader.question("Re-enter your spotify password", {
//         hideEchoBack: true,
//     })

//     while (spotifyPassword != spotifyVerify) {
//         console.log("Passwords do not match, try re-entering your password")
//         spotifyPassword = reader.question("Enter your spotify password", {
//             hideEchoBack: true,
//         })
//         spotifyVerify = reader.question("Re-enter your spotify password", {
//             hideEchoBack: true,
//         })
//     }

//     let spotifyPasswordEncrypt = ""
//     for (let i = 0; i < spotifyPassword.length; i++) {
//         spotifyPasswordEncrypt += "*"
//     }

//     console.log("Your information: \n")
//     console.log("[Playlist name]: " + playListName + "\n")
//     console.log("[Playlist link]: " + link + "\n")
//     console.log("[Spotify username/email]: " + spotifyEmail + "\n")
//     console.log("[Spotify password]: " + spotifyPasswordEncrypt + "\n")

//     if (reader.keyInYN("Please confirm your credentials: \n") == false) {
//         exit()
//     }

//     return {
//         name: playListName,
//         link: link,
//         email: spotifyEmail,
//         password: spotifyPassword,
//     }
// }
/**
 * This function takes in a URL of a YouTube playlist and will save each
 * individual song and its artist into an array.
 * @param {dictionary} info - information given from the user
 */

const puppeteer = require("puppeteer")

let listSong = []
let listChannel = []
let failedTransfers = []
let totalNum = 0

async function transferPlaylist(info) {
    let ready = false
    console.log("\nOpening browser...\n")

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0)

    // Check the link that user provided
    try {
        if (!info.link.includes("https://www.youtube.com")) {
            throw new Error("Not a valid link")
        }
        await page.goto(info.link, { waitUntil: "networkidle2" })
    } catch (error) {
        console.log("Invalid link. Ensure the playlist is public or unlisted.")
        await browser.close()
        return process.exit(1)
    }

    await page.setViewport({ width: 1200, height: 800 })

    console.log("Scraping playlist...")

    // Scroll to load all videos
    await page.evaluate(async () => {
        const distance = 100
        const delay = 100
        while (
            document.scrollingElement.scrollTop + window.innerHeight <
            document.scrollingElement.scrollHeight
        ) {
            document.scrollingElement.scrollBy(0, distance)
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
    })

    // Extract the number of videos in the playlist
    try {
        const lengthOfPlaylist = await page.evaluate(() => {
            const totalVideos = document.querySelectorAll(
                "ytd-playlist-video-renderer"
            )
            return totalVideos.length
        })
        totalNum = lengthOfPlaylist
    } catch (error) {
        console.log("Error fetching number of videos.")
        await browser.close()
        return process.exit(1)
    }

    let indexTotalNum = totalNum

    // For-loop saves the title and channel from each song in the playlist
    for (let indx = 1; indx <= indexTotalNum; indx++) {
        try {
            // Save the name of the song
            const songElement = await page.$(
                `ytd-playlist-video-renderer:nth-child(${indx}) #video-title`
            )
            const nameSong = await page.evaluate(
                (el) => el.textContent.trim(),
                songElement
            )

            // Save the name of the channel
            const channelElement = await page.$(
                `ytd-playlist-video-renderer:nth-child(${indx}) ytd-channel-name a`
            )
            const nameChannel = await page.evaluate(
                (el) => el.textContent.trim(),
                channelElement
            )

            if (nameChannel.length === 0 || nameSong.length === 0) {
                continue
            } else {
                console.log(nameSong, nameChannel)
                listSong.push(nameSong)
                listChannel.push(nameChannel)
            }
        } catch (error) {
            // A deleted video has been found.
            console.log("<Found deleted video..>")
            continue
        }
    }

    console.log(listSong)
    console.log(listChannel)
    await browser.close()
    await makeSpotifyPlaylist(info)
}

async function makeSpotifyPlaylist(userInfo) {
    let numSuccess = 0
    console.log("Now transferring...")
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 800 })
    await page.setDefaultNavigationTimeout(0)

    await page.goto(
        "https://accounts.spotify.com/en/login?continue=https:%2F%2Fopen.spotify.com%2F",
        { waitUntil: "networkidle2" }
    )

    await page.type("input#login-username", userInfo.email)
    await page.type("input#login-password", userInfo.password)

    await Promise.all([
        page.click("button#login-button"),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
    ])

    await page.waitForSelector(
        "button.cljOO1tpzixzXctKJucK.nGWhztVvLY1BInXjcWYa.NxEINIJHGytq4gF1r2N1.or84FBarW2zQhXfB9VFb.XNjgtSbyhshr7YQcVvry.O0AN8Ty_Cxd4iLwyKATB.D8wJ9TPfJzLeLJYxnad2.zWWLnqWslTLHwq3wBgGB"
    )
    await page.click(
        "button.cljOO1tpzixzXctKJucK.nGWhztVvLY1BInXjcWYa.NxEINIJHGytq4gF1r2N1.or84FBarW2zQhXfB9VFb.XNjgtSbyhshr7YQcVvry.O0AN8Ty_Cxd4iLwyKATB.D8wJ9TPfJzLeLJYxnad2.zWWLnqWslTLHwq3wBgGB"
    )

    await page.waitForSelector("button.mWj8N7D_OlsbDgtQx5GW")
    await page.click("button.mWj8N7D_OlsbDgtQx5GW")

    await page.waitForSelector("button.wCkmVGEQh3je1hrbsFBY")
    await page.click("button.wCkmVGEQh3je1hrbsFBY")

    await page.type(
        "input.f0GjZQZc4c_bKpqdyKbq.JaGLdeBa2UaUMBT44vqI",
        userInfo.name
    )

    await Promise.resolve(
        await page.click(
            "button.Button-sc-qlcn5g-0.iJUiBm.encore-text-body-medium-bold"
        )
    )

    // This for-loop will search the song on Spotify and add it to the playlist
    for (let i = 0; i < totalNum; i++) {
        try {
            await page.waitForSelector(
                "input.encore-text.encore-text-body-small.FeWwGSRANj36qpOBoxdx"
            )
            await page.type(
                "input.encore-text.encore-text-body-small.FeWwGSRANj36qpOBoxdx",
                listSong[i]
            )

            await page.waitForSelector(
                "button.Button-sc-y0gtbx-0.fbysdG.encore-text-body-small-bold"
            )
            await page.click(
                "button.Button-sc-y0gtbx-0.fbysdG.encore-text-body-small-bold"
            )

            await page.waitForSelector("button.JzyZE2R09wq7xtjECDeR")
            await page.click("button.JzyZE2R09wq7xtjECDeR")
                
        } catch (error) {
            failedTransfers.push(listSong[i] + " - " + listChannel[i])
            console.log(
                "Failed to transfer: " + listSong[i] + " - " + listChannel[i]
            )
        }
    }

    await browser.close()

    // Display the results
    console.log("Successfully added " + numSuccess + "/" + totalNum + " songs!")
    console.log("Failed transfers: ")
    for (let index = 0; index < failedTransfers.length; index++) {
        console.log(failedTransfers[index])
    }
    return process.exit(0)
}

let info = {
    name: "Hindi Old Classics",
    link: "https://www.youtube.com/playlist?list=PLjrle6cl2mIUilRjpb40Uvm0WulCz3obg",
    email: process.env.EMAIL.toString(),
    password: process.env.PASSWORD.toString(),
}
// var informationFromUser = getInformationFromUser()
transferPlaylist(info)
