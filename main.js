// Cursed 2048

//----------------- Declarations ---------------//

let grid = [['0','0','0','0'],['0','0','0','0'],['0','0','0','0'],['0','0','0','0']]
let mergedgrid = [[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]]
const gamespace = document.getElementById("gamespace")
const givenvalues = ['2','4']
let gamerunning = true
let debounce = false
let lossdiv = null
let itouchx = 0
let itouchy = 0
let etouchx = 0
let etouchy = 0
//------------- Change as you will -------------//

const colours = ['#A7D3E0', '#4875a3ff','#2C3E50','#152e46ff','#F1B142','#D1A378','#E7B3B1','#C084D0','#833E94','#A84D9E','#5E1F1D']
const specialcolours = ['#A89B8D','#c25c5cff','#58969bff','#2c646bff','#b15821ff','#2d8b1aff']
const multcolour = '#6E9A95'
const givenspecials = ['x2','x1.5','x0']
let mindivisor = 0.5

/////-------------- FUNCTIONS ---------------/////

//-------- Python Replacement functions --------//
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function deepcopy(array) {
    return JSON.parse(JSON.stringify(array))
}

//--------------- Reset functions --------------//

function resetgrid(grid) {
    grid = [['0','0','0','0'],['0','0','0','0'],['0','0','0','0'],['0','0','0','0']]
    return grid
}

function resetmergedgrid() {
    mergedgrid = [[false,false,false,false],[false,false,false,false],[false,false,false,false],[false,false,false,false]]
}

//------------- Debugging functions ------------//

function loggrid(grid) {
    console.log( '\t' + '-' + '\t\t' + '-' + '\t\t' + '-' + '\t\t' + '-') 
    for(index in grid) {
        let outstring = '|\t'
        for(lindex in grid[index]) {
            if (grid[index][lindex]  != '0') {
                outstring += grid[index][lindex] 
            }
            outstring += '\t|\t'

        }
        console.log(outstring)    
        console.log( '\t' + '-' + '\t\t' + '-' + '\t\t' + '-' + '\t\t' + '-') 
    }
}

//--------------- HTML functions ---------------//

function createsquare(positionx,positiony, value) {
    let leftpercent = positiony*24 + 4
    let toppercent = positionx*24 + 4
    let colourindex = Math.log2(value)
    let colour = multcolour
    if (typeof value != 'string') {
        if (Number.isInteger(colourindex) && colourindex > 0) {
            while (colourindex > colours.length) {
                colourindex -= colours.length
            }
            colour = colours[colourindex-1]
        }
        else if (value > 0){
            colourindex = Math.ceil(colourindex)
            while (colourindex > specialcolours.length) {
                colourindex -= colours.length
            }
            colour = specialcolours[colourindex-1]
        } else {
            return null
        }
    }
    let square = document.createElement('div')
    square.classList.add("blanksquare")
    square.style.backgroundColor = colour
    square.style.left = String(leftpercent) + '%'
    square.style.top = String(toppercent) + '%'
    square.id = String(positionx)+'|'+String(positiony)
    gamespace.appendChild(square)
    let span = document.createElement('span')
    span.classList.add("blockfont")
    span.innerHTML = String(value)
    square.appendChild(span)
    setTimeout(() => square.style.opacity = '1' ,1)
    return square
}

function movesquare(originx,originy,destx,desty) {
    let square = document.getElementById(String(originx) + '|' + String(originy))
    if (originx == destx) {
        square.style.left = String(desty*24 + 4) + '%'
    } else {
        square.style.top = String(destx*24 + 4) + '%'
    }
    square.id = String(destx) + '|' + String(desty)

}
function mergesquare(deadx,deady,newx,newy,newvalue) {
    let deadsquare = document.getElementById(String(deadx)+'|'+String(deady))
    let newdeadsquare = document.getElementById(String(newx)+'|'+String(newy))
    let newsquare = createsquare(newx,newy,newvalue)
    setTimeout(() => {
        deadsquare.style.opacity = '0'
        newdeadsquare.style.opacity = '0'
        deadsquare.remove()
        newdeadsquare.remove() 
    }, 1)    
}

//-------------- Other functions ---------------//

function findzeros(grid) {
    let zeroslocationslist = []
    for (let x=0; x < 4; x++) {
        for (let y=0; y<4; y++) {
            if (grid[x][y] == '0') {
                zeroslocationslist.push([x,y])
            }
        }
    }
    return zeroslocationslist
}

function summonnumber() {
    let possiblelist = findzeros(grid)
    if (possiblelist.length > 0) {
        let rand = randInt(0,possiblelist.length-1)
        let randomlocation = possiblelist[rand]
        possiblelist.splice(rand,1)
        let value = givenvalues[randInt(0,1)]
        grid[randomlocation[0]][randomlocation[1]] = value
        createsquare(randomlocation[0],randomlocation[1],Number(value))
        if (randInt(1,5) == 5 && possiblelist.length-1 > 0) {
            rand = randInt(0,possiblelist.length-1)
            randomlocation = possiblelist[rand]
            let special = givenspecials[randInt(0,givenspecials.length-1)]
            grid[randomlocation[0]][randomlocation[1]] = special
            createsquare(randomlocation[0],randomlocation[1],special)
        }
    }
}

function mergecheck(pval, sval) {
    let outnum = 0
    if (givenspecials.includes(pval) && !givenspecials.includes(sval)) {
        outnum = Number(sval) * Number(pval.slice(1))
        if (outnum % mindivisor == 0 || outnum == 0) {
            return Number(outnum)
        }
        else {
            return Number(sval)
        }
    }
    else if (!givenspecials.includes(pval) && givenspecials.includes(sval)) {
        outnum = Number(pval) * Number(sval.slice(1))
        if (outnum % mindivisor == 0 || outnum == 0) {
            return Number(outnum)
        }
        else {
            return Number(pval)
        }
    }
    else if (pval == sval && !givenspecials.includes(pval)) {
        return Number(Number(pval) + Number(sval))   
    }       
    else {
        return Number(-1)
    }
}

function rightmove(igrid, losschecking = false) {
    return new Promise((resolve) => {
    let grid = deepcopy(igrid)
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 3; y > -1; y--) {
                    if (grid[x][y] != '0' && y < 3 && grid[x][y+1] == '0') {
                        let tempy = y
                        let newy = tempy
                        while (tempy < 3 && grid[x][tempy+1] == '0') {
                            tempy += 1
                            newy = tempy 
                        }               
                        grid[x][newy] = grid[x][y] 
                        if (!losschecking) {  
                            movesquare(x,y,x,newy)  
                        }
                        grid[x][y] = '0'
                    }
                }
            }
        }, 0);
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 3; y > 0; y--) {
                    if (!mergedgrid[x][y] && grid[x][y] != '0' && grid[x][y-1] != '0') {
                        let mergednum = mergecheck(grid[x][y],grid[x][y-1])
                        if (mergednum > -1) {
                            grid[x][y] = String(mergednum)
                            grid[x][y-1] = '0'
                            if (!losschecking) {
                                mergesquare(x,y-1,x,y,mergednum)
                            }
                            mergedgrid[x][y] = true
                        }
                    }
                }
            }
        }, 50);
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 3; y > -1; y--) {
                    if (grid[x][y] != '0' && y < 3 && grid[x][y+1] == '0') {
                        let tempy = y
                        let newy = tempy
                        while (tempy < 3 && grid[x][tempy+1] == '0') {
                            tempy += 1
                            newy = tempy 
                        }               
                        grid[x][newy] = grid[x][y]
                        if (!losschecking) {
                            movesquare(x,y,x,newy)   
                        }         
                        grid[x][y] = '0'
                    }
                }
            }
        resetmergedgrid()
        resolve(grid)
        }, 75);
    })
}

function leftmove(igrid, losschecking = false) {
    return new Promise((resolve) => {
        let grid = deepcopy(igrid)
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    if (grid[x][y] != '0' && y > 0 && grid[x][y-1] == '0') {
                        let tempy = y
                        let newy = tempy 
                        while (tempy > 0 && grid[x][tempy-1] == '0') {
                            tempy -= 1
                            newy = tempy  
                        }              
                        grid[x][newy] = grid[x][y]
                        if (!losschecking) {
                            movesquare(x,y,x,newy)   
                        }              
                        grid[x][y] = '0'
                    }
                }
            }
        }, 0);
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 3; y++) {
                    if  (!mergedgrid[x][y] && grid[x][y] != '0' && grid[x][y+1] != '0') {
                        let mergednum = mergecheck(grid[x][y],grid[x][y+1])
                        if (mergednum > -1) {
                            grid[x][y] = String(mergednum)
                            grid[x][y+1] = '0'
                            if (!losschecking) {
                                mergesquare(x,y+1,x,y,mergednum)
                            }
                            mergedgrid[x][y] = true
                        }
                    }
                }
            }
        }, 50);
        setTimeout(() => {
            for (let x = 0; x < 4; x++) {
                for (let y = 0; y < 4; y++) {
                    if (grid[x][y] != '0' && y > 0 && grid[x][y-1] == '0') {
                        let tempy = y 
                        let newy = tempy
                        while (tempy > 0 && grid[x][tempy-1] == '0') {
                            tempy -= 1
                            newy = tempy  
                        }              
                        grid[x][newy] = grid[x][y]
                        if (!losschecking) {  
                            movesquare(x,y,x,newy)   
                        }            
                        grid[x][y] = '0'
                    }
                }
            }
        resetmergedgrid()
        resolve(grid)
    }, 75);
    })
}

function upmove(igrid, losschecking = false) {
    return new Promise((resolve) => {
        let grid = deepcopy(igrid)
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (grid[x][y] != '0' && x > 0 && grid[x-1][y] == '0') {
                        let tempx = x
                        let newx = tempx
                        while (tempx > 0 && grid[tempx-1][y] == '0') {
                            tempx -= 1
                            newx = tempx  
                        }              
                        grid[newx][y] = grid[x][y]
                        if (!losschecking) {
                            movesquare(x,y,newx,y) 
                        }   
                        grid[x][y] = '0' 
                    }
                }
            }
        }, 0);
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 3; x++) {
                    if (!mergedgrid[x][y] && grid[x][y] != '0' && grid[x+1][y] != '0') {
                        let mergednum = mergecheck(grid[x][y],grid[x+1][y])
                        if (mergednum > -1) {
                            grid[x][y] = String(mergednum)
                            grid[x+1][y] = '0'
                            if (!losschecking) {
                                mergesquare(x+1,y,x,y,mergednum)
                            }
                            mergedgrid[x][y] = true
                        }
                    }
                }
            }
        }, 50);
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (grid[x][y] != '0' && x > 0 && grid[x-1][y] == '0') {
                        let tempx = x
                        let newx = tempx
                        while (tempx > 0 && grid[tempx-1][y] == '0') {
                            tempx -= 1
                            newx = tempx  
                        }              
                        grid[newx][y] = grid[x][y]
                        if (!losschecking) {
                            movesquare(x,y,newx,y) 
                        }  
                        grid[x][y] = '0' 
                    }
                }
            }

        resetmergedgrid()
        resolve(grid)
        }, 75);
    })
}

function downmove(igrid,losschecking = false) {
    return new Promise((resolve) => {
        let grid = deepcopy(igrid)
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 3; x > -1; x--) {
                    if (grid[x][y] != '0' && x < 3 && grid[x+1][y] == '0') {
                        let tempx = x
                        let newx = tempx
                        while (tempx < 3 && grid[tempx+1][y] == '0') {
                            tempx += 1
                            newx = tempx 
                        }               
                        grid[newx][y] = grid[x][y] 
                        if (!losschecking) {
                            movesquare(x,y,newx,y)   
                        }           
                        grid[x][y] = '0'
                    }
                }
            }
        }, 0);
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 3; x > 0; x--) {
                    if (!mergedgrid[x][y] && grid[x][y] != '0' && grid[x-1][y] != '0') {
                        let mergednum = mergecheck(grid[x][y],grid[x-1][y])
                        if (mergednum > -1) {
                            grid[x][y] = String(mergednum)
                            grid[x-1][y] = '0'
                            if (!losschecking) {
                                mergesquare(x-1,y,x,y,mergednum)
                            }
                            mergedgrid[x][y] = true
                        }
                    }
                }
            }
        }, 50);
        setTimeout(() => {
            for (let y = 0; y < 4; y++) {
                for (let x = 3; x > -1; x--) {
                    if (grid[x][y] != '0' && x < 3 && grid[x+1][y] == '0') {
                        let tempx = x
                        let newx = tempx
                        while (tempx < 3 && grid[tempx+1][y] == '0') {
                            tempx += 1
                            newx = tempx 
                        }               
                        grid[newx][y] = grid[x][y] 
                        if (!losschecking) {
                            movesquare(x,y,newx,y)   
                        }           
                        grid[x][y] = '0'
                    }
                }
            }
        resetmergedgrid()
        resolve(grid)
        }, 75);
    })
}

async function losscheck(grid) {
    if (findzeros(grid).length == 0) {
        let utempgridzeros = findzeros(await upmove(grid, true)).length
        let dtempgridzeros = findzeros(await downmove(grid, true)).length
        let ltempgridzeros = findzeros(await leftmove(grid, true)).length
        let rtempgridzeros = findzeros(await rightmove(grid, true)).length
        if (utempgridzeros == 0 && dtempgridzeros == 0 && ltempgridzeros == 0 && rtempgridzeros == 0) {
            //lose condition
            console.log("You lose")
            gamerunning = false
            lossdiv = document.createElement("div")
            document.getElementById("container").appendChild(lossdiv)
            lossdiv.classList.add("losssquare")
            
            let span = document.createElement('span')
            span.classList.add("losefont")
            span.innerHTML = "You Lose"
            lossdiv.appendChild(span)

            setTimeout(() => lossdiv.style.opacity = "1", 1);
        }
    }
}

async function gamemove(key) {
        if (['w','arrowup'].includes(key)) {
            grid = await upmove(grid)
        } else if (['a','arrowleft'].includes(key)) {
            grid = await leftmove(grid)
        } else if (['s','arrowdown'].includes(key)) {
            grid = await downmove(grid)
        } else if (['d','arrowright'].includes(key)) {
            grid = await rightmove(grid)
        } else {
            return
        }
}

document.getElementById("restartbutton").addEventListener("click", () => {
    if (lossdiv != null) {
        lossdiv.remove()
        lossdiv = null
    }
    grid = resetgrid(grid)
    resetmergedgrid()
    document.getElementById("gamespace").innerHTML = ""
    gamerunning = true
    summonnumber()
})

document.addEventListener("keydown", async function(event) {
    if (gamerunning && !event.repeat && !debounce) {
        debounce = true
        const key = event.key.toLowerCase() 
        console.log('key: ' + key)
        await gamemove(key)
        summonnumber()
        loggrid(grid)
        await losscheck(grid)
        debounce = false
    }
    return
})

document.addEventListener("touchstart", function(event) {
    itouchx = event.changedTouches[0].screenX
    itouchy = event.changedTouches[0].screenY
})

document.addEventListener("touchend", async function(event) {
    let key = ""
    etouchx = event.changedTouches[0].screenX
    etouchy = event.changedTouches[0].screenY
    let dtouchx = etouchx - itouchx
    let dtouchy = etouchy - itouchy
    if (Math.abs(dtouchx) > Math.abs(dtouchy) && Math.abs(dtouchx) > 30) {
        if (dtouchx > 0) {
            key = "d"
        } else {
            key = "a"
        }
    } 
    else if (Math.abs(dtouchy) > Math.abs(dtouchx) && Math.abs(dtouchy) > 30) {
        if (dtouchy > 0) {
            key = "s"
        } else {
            key = "w"
        }
    } 
    else {
        return
    }
    if (gamerunning && !debounce) {
        debounce = true
        console.log('key: ' + key)
        await gamemove(key)
        summonnumber()
        loggrid(grid)
        await losscheck(grid)
        debounce = false
    }
    return 
})

summonnumber()