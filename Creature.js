"use strict";
class Creature {
    constructor (community,type,x,y,birthmark) {
       	//,['red','green','blue'][Math.floor(Math.random()*3)]
        if (['green','red','blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Creature type`)
        if (typeof x != 'number') throw new TypeError(`x: ${x} is not a number`)
        if (typeof y != 'number') throw new TypeError(`y: ${y} is not a number`)

        this.community = community
        this.type = type
        this.x = x
        this.y = y
        this.birthmark = birthmark

        this.energy = 90
    }

    ///////////////////////////////////////////////
    // Creature-Oriented //////////////////////////
    ///////////////////////////////////////////////
    step () {
        this.move()
        this.eat()
        this.reproduce()
		this.boundTest()
    }

	distanceTo (target) {
		return (Math.pow(Math.abs(target.x - this.x),2) + Math.pow(Math.abs(target.y - this.y),2)) //euclidean distance squared
	}
    ///////////////////////////////////////////////

    ///////////////////////////////////////////////
    // Debug //////////////////////////////////////
    ///////////////////////////////////////////////
    toString () {
        return `Behold: ${this.type} creature, at (${Math.round(this.x)},${Math.round(this.y)}), feeling ${Math.round(this.energy)}.` + (typeof this.birthmark != 'undefined' ? ` ((( ${Math.round(this.birthmark)} )))` : '')
    }
    ///////////////////////////////////////////////
	boundTest () {
		if (Math.floor(this.x/this.community.pixelsPerCommunity) != this.community.x || Math.floor(this.y/this.community.pixelsPerCommunity) != this.community.y) 
		{
			this.newCommunity = this.findCommunity(); 
			if(!this.newCommunity) this.die() 
			else this.relocate(this.newCommunity) } 
	}

	findCommunity () {
		var x,y
		x = Math.floor(this.x/this.community.pixelsPerCommunity)
		y = Math.floor(this.y/this.community.pixelsPerCommunity)
		for(var i = 0, l = mainNeighbourhood.length; i < l; i++)
			{ if(mainNeighbourhood[i].x == x && mainNeighbourhood[i].y == y) return mainNeighbourhood[i]}
		return false
	}
}

class Carnivore extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['red'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Carnivore-Creature type`)
		
		super(community,type,x,y,birthmark)
        this.energy = 80

        community.Carnivores.push(this)

	}

    move () {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (22))
            this.y += Math.round(( Math.random() - 0.5 ) * (22))
            this.energy -= 1
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -100) {
            this.die()
        }
    }

    eat () {
        this.community.Herbis.filter(
            candidate => Math.abs(candidate.x - this.x) < 12 && Math.abs(candidate.y - this.y) < 12
        ).forEach(prey => {
            prey.die()
            this.energy += 45
        })
    }

    reproduce () {
        if (this.energy > 100) {
            new Carnivore(this.community,this.type,Math.floor(this.x+((Math.random()-0.5)*8) ),Math.floor(this.y+(Math.random()-0.5)*8),this.energy)
            this.energy -= 100
        }
    }

    die () {
        var index = this.community.Carnivores.indexOf(this)
        if (index >= 0) {
            this.community.Carnivores.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }

	relocate (newNeighbourhood) {
		    var index = this.community.Carnivores.indexOf(this)
		    if (index >= 0) {
		        this.community.Carnivores.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		newNeighbourhood.Carnivores.push(this)
		this.community = newNeighbourhood
		this.die()
	}

	getColour() {
	return [1.0, 0.0, 0.0, 1.0];
	}
}

class Herbi extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Herbi-Creature type`)
		
		super(community,type,x,y,birthmark)
        this.energy = 40

        community.Herbis.push(this)

	}

    move () {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (20))
            this.y += Math.round(( Math.random() - 0.5 ) * (20))
            this.energy -= 1
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -100) {
            this.die()
        }
    }

    eat () {
        this.community.Plants.filter(
            candidate => Math.abs(candidate.x - this.x) < 10 && Math.abs(candidate.y - this.y) < 10
        ).forEach(prey => {
            prey.die()
            this.energy += 30
        })
    }

    reproduce () {
        if (this.energy > 100) {
			if(Math.random() * 100 > 0.05) {
            new Herbi(this.community,this.type,Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
            this.energy -= 100
			}
			else {new Carnivore(this.community,"red",Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
			}
        }
    }

    die () {
        var index = this.community.Herbis.indexOf(this)
        if (index >= 0) {
            this.community.Herbis.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }
	relocate (newNeighbourhood) {
		    var index = this.community.Herbis.indexOf(this)
		    if (index >= 0) {
		        this.community.Herbis.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		newNeighbourhood.Herbis.push(this)
		this.community = newNeighbourhood
	}

	getColour() {
	return [0.0, 0.0, 1.0, 1.0];
	}
}

class Plant extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['green'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Plant-Creature type`)
		
		super(community,type,x,y,birthmark)

        this.energy = 40

        community.Plants.push(this)
    }

    eat () {
			this.energy +=11 // mmm solar power
			this.community.Plants.filter(
            candidate => Math.abs(candidate.x - this.x) < 12 && Math.abs(candidate.y - this.y) < 12 && this.distanceTo(candidate) < 576 && candidate != this
        	).forEach(competition => {
            this.energy -= 2
        })
	}

    move () {
        if (this.energy < -100) {
            this.die()
        }
    }

    reproduce () {
        if (this.energy > 120) { 
			{if(Math.random() * 100 > 0.1) 
	            new Plant(this.community,this.type,Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			else new Herbi (this.community,"blue",Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			}            
			this.energy -= 100
        }
	}

    die () {
        var index = this.community.Plants.indexOf(this)
        if (index >= 0) {
            this.community.Plants.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }

	relocate (newNeighbourhood) {
		newNeighbourhood.Plants.push(this)
		    var index = this.community.Plants.indexOf(this)
		    if (index >= 0) {
		        this.community.Plants.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		this.community = newNeighbourhood
	}

	getColour() {
	return [0.0, 1.0, 0.0, 1.0];
	}
}

class Community {
    constructor (x,y,neighbourhood, pixelsPerCommunity) {
	this.x = x
	this.y = y
	this.neighbourhood = neighbourhood 

	this.pixelsPerCommunity = pixelsPerCommunity

	this.centerX = (pixelsPerCommunity*(x + 0.5))
	this.centerY = (pixelsPerCommunity*(y + 0.5))
//	center () { return {(200*this.x + 100), (200*this.y + 100)} }

	this.lowerBound = this.centerX + pixelsPerCommunity/2
	this.upperBound = this.centerX - pixelsPerCommunity/2
	this.rightBound = this.centerY - pixelsPerCommunity/2
	this.leftBound = this.centerY + pixelsPerCommunity/2

	this.Plants = []
	this.Herbis = []
	this.Carnivores = []
	this.neighbour = []
	this.getNeighbours()

	}

	getNeighbours () {
			this.neighbourhood.forEach(
		        candidate => {
					if(candidate.x == this.x) {
						if(candidate.y == this.y + 1) {this.neighbour['lower'] = candidate; candidate.neighbour['upper'] = this; }
						else if(candidate.y == this.y - 1) {this.neighbour['upper'] = candidate; candidate.neighbour['lower'] = this; }
					}
					else if(candidate.y == this.y) {
						if(candidate.x == this.x + 1) {this.neighbour['right'] = candidate; candidate.neighbour['left'] = this; }
						else if(candidate.x == this.x - 1) {this.neighbour['left'] = candidate; candidate.neighbour['right'] = this; }
					}
				}
			)
	}

	getCreatures () { 
		return this.Plants.concat(this.Herbis).concat(this.Carnivores)
	}

	  toString () {
        return `This community: : ${this.x},${this.y} with ${this.Plants.length} Plants and ${this.Herbis.length} Herbivores. (${this.upperBound}, ${this.lowerBound}, ${this.rightBound}, ${this.leftBound})`
	}
}


/*
function getAllCreatures (Neighbourhood) {  
	var AllCreatures = []
//	AllCreatures.push( Neighbourhood.forEach( Community => Community.getCreatures() ) )
	return AllCreatures;
 }*/ 
//(Community => Community.getCreatures().forEach(creature => creature.step()) )

/*for(var i = 0; i < 3; i++){
	for(var j = 0; j <3; j++){

		mainNeighbourhood[(i*3+j)] = new Community(i,j,mainNeighbourhood) 
	}
}*/

//var mainCommunity = new Community(0,0,mainNeighbourhood)

