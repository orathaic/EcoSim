"use strict";
class Creature {
    constructor (type,x,y,birthmark) {
        if (['green', 'yellow','red','blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Creature type`)
        if (typeof x != 'number') throw new TypeError(`x: ${x} is not a number`)
        if (typeof y != 'number') throw new TypeError(`y: ${y} is not a number`)

        this.community = this.findCommunity(x, y)
		if(!this.community) return false
		else
        this.type = type

		if(this.community) this.community.creatures[this.type].push(this)		

        this.moveDistance = 0

        this.x = x
        this.y = y

        this.birthmark = birthmark
    }

    step () {
        this.move( this.moveDistance )
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
		if (Math.floor(this.x/pixelsPerCommunity) != this.community.x || Math.floor(this.y/pixelsPerCommunity) != this.community.y) 
		{
			this.newCommunity = this.findCommunity( this.x, this.y ); 
			if(!this.newCommunity) this.die() 
			else this.relocate(this.newCommunity) } 
	}
	
	move ( distance ) {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (distance))
            this.y += Math.round(( Math.random() - 0.5 ) * (distance))
            this.energy -= 10
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -20) {
            this.die()
        }
    }

	relocate (newNeighbourhood) {
	//	var type = this.typeName
	    var index = this.community.creatures[this.type].indexOf(this)
	    if (index >= 0) {
	        this.community.creatures[this.type].splice(index,1)
	    }
	    else {
	        throw new Error('Creature community corruption error.')
	    }
	newNeighbourhood.creatures[this.type].push(this)
	this.community = newNeighbourhood
	}

    die () {
        var index = this.community.creatures[this.type].indexOf(this)
        if (index >= 0) {
            this.community.creatures[this.type].splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }
	
	findCommunity (CreatureX, CreatureY) {
		var x,y
		x = Math.floor(CreatureX/pixelsPerCommunity)
		y = Math.floor(CreatureY/pixelsPerCommunity)
		for(var i = 0, l = mainNeighbourhood.length; i < l; i++)
			{ if(mainNeighbourhood[i].x == x && mainNeighbourhood[i].y == y) return mainNeighbourhood[i]}
		return false
	}
	
	addEdgeCommunities (range, targetArray) { 		// edge effects 
		var next, communityWidth = pixelsPerCommunity 
		if( (communityWidth * (this.community.x+1) - this.x)  < range)
			{
				next =  this.findCommunity(this.community.x + range + 1, this.community.y)
				if(next) targetArray.push(next)
			}
		else if ( (this.x - communityWidth * (this.community.x))  < range)
			{
				next = this.findCommunity(this.community.x - range - 1, this.community.y)
				if(next) targetArray.push(next)
			}
		if( (communityWidth * (this.community.y+1) - this.y)  < range)
			{
				next = this.findCommunity(this.community.x, this.community.y + range + 1)
				if(next) targetArray.push(next)
			}
		else if ( (this.y - communityWidth * (this.community.y))  < range)
			{
				next = this.findCommunity(this.community.x, this.community.y - range - 1) 
				if(next) targetArray.push(next)
			}
	}
	getCreatureInfo ()
	{
		return "Base Creature - info not implemented."
	}
	creatureStringify()
	{
		return `"type":"${this.type}","moveDistance":${this.moveDistance},"x":${this.x},"y":${this.y}`
	}

}

class Herbi extends Creature {
    constructor (type,x,y,birthmark) {
        if (['blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Herbi-Creature type`)
		
		super(type,x,y,birthmark)
        this.energy = 80
		this.moveDistance = 20
		this.range = 10		
		this.size = 1
	}

    eat () {
		const range = this.range
		var targetCommunities = [this.community]
		this.addEdgeCommunities(range, targetCommunities)

		for(var i = 0, l = targetCommunities.length; i < l; i++)
		{
			[...targetCommunities[i].creatures['green'], ...targetCommunities[i].creatures['yellow']].filter(
				candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range
			).forEach(prey => {
				prey.energy -= 40
				if(prey.type == 'green')
				this.energy += 10
				else if(prey.type == 'yellow')
				this.energy -= 10
			})
		}
	}

    reproduce () {
        if (this.energy > 100) {
			if(Math.random() * 100 > 0.0) {
            new Herbi(this.type,Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
            this.energy -= 90
			}
			else {new Carnivore("red",Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
			}
        }
    }

		creatureStringify()
	{
		
		return `{` + super.creatureStringify()+`,"energy":${this.energy}}`
	}
}

class Plant extends Creature {
    constructor (type,x,y,birthmark, moveDistance = 0, range = 12, size = 10, MinToReproduce = 120, offSpringEnergy = 45, offSpringSize = 10, spawnMaxDistance = 48, mutationRate = 2) {
        if (['green', 'yellow'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Plant-Creature type`)
		
		var result = super(type,x,y,birthmark)
		if(!result) return false

        this.energy = (birthmark - 1)
		this.moveDistance = moveDistance
		this.range = range
		this.shade = []
		
		this.generateShade()

		this.MinToReproduce = MinToReproduce
		this.offSpringEnergy = offSpringEnergy
		this.offSpringSize = offSpringSize // TODO: make this cost more energy!
//		this.efficiency = 1.5 // efficiency should be an emergent quality.
		this.size = size
		this.spawnMaxDistance = spawnMaxDistance
		this.mutationRate = 2 // as a percentage

    }

	generateShade() {
	const range = this.range
			if(this.community == false) return
			var targetCommunities = [this.community]
			this.addEdgeCommunities(range, targetCommunities)

			for(var i = 0, l = targetCommunities.length; i < l; i++)
			{ 
				[...targetCommunities[i].creatures['green'], ...targetCommunities[i].creatures['yellow']].filter(
		        	candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range 
					&& this.distanceTo(candidate) < range*range && candidate != this
		    	).forEach(competition => {
		        	this.shade.push(competition)
					competition.shade.push(this)
				})
			}
	}

	getTotalShade() {
		var totalShade = 0
		this.shade.forEach( function(shader){ return totalShade += shader.size} )
		//console.log("total shade "+totalShade)
		return totalShade * 0.05
	}

	loseShade(loss) {
	var index = this.shade.indexOf(loss)
		if (index >= 0) {
			this.shade.splice(index,1)	
		}
	}

    eat () {
			
			this.energy = Math.floor( Math.min((this.energy + this.size*0.2 - this.getTotalShade()), this.size * 2 ) ) // mmm solar power		
			
			if(this.energy > (this.size * 2 * 0.9))	{this.grow() }
	}

	grow () {
	 this.size += 2
	 this.energy -= 20
	}

    move ( ) {
        if (this.energy < -10) {
			this.shade.forEach(target => target.loseShade(this))
            this.die()
        }
    }


    reproduce () {
        if (this.energy > this.MinToReproduce) { var rand = Math.random() * 100
			{if(rand > this.mutationRate) 

	            new Plant(
						this.type
						,Math.round(this.x+(Math.random() - 0.5 )*this.spawnMaxDistance)
						,Math.floor(this.y+(Math.random() - 0.5)*this.spawnMaxDistance)
						,this.offSpringEnergy
						,this.moveDistance 
						,this.range 
						,this.offSpringSize
						,this.MinToReproduce 
						,this.offSpringEnergy 
						,this.offSpringSize // for the offspring's offspring 
						,this.spawnMaxDistance
						,this.mutationRate 
						)
				else
				{	var mutant = [this.MinToReproduce, this.offSpringEnergy, this.offSpringSize, this.spawnMaxDistance, this.mutationRate]
					rand *= 5
					for(var i =0; i<this.mutationRate*5; i+= 1 )
					{
						if (Math.floor(rand-i) == 1) {mutant[i%5] = Math.round(mutant[i%5]* Math.pow(1.1, (i%2)?1:-1) )}
					} 
					new Plant( 
						this.type
						,Math.round(this.x+(Math.random() - 0.5 )*this.spawnMaxDistance)
						,Math.floor(this.y+(Math.random() - 0.5)*this.spawnMaxDistance)
						,this.offSpringEnergy // this is how much energy you give your offspring, we mutate that energy they will give their offspring.
						,this.moveDistance //0
						,this.range //12 
						,this.offSpringSize
						, ...mutant
						)
				} 
	}           
			this.energy -= this.offSpringEnergy
        }
	}

	getCreatureInfo () { var targetCreature = this
				return	`Creaure: ${targetCreature.type} \n`
						+`Size: ${targetCreature.size/10} \n`
						+`Energy: ${targetCreature.energy} \n`
						+`Shaded by: ${targetCreature.shade.length} \n`
						+`Breed When: ${targetCreature.MinToReproduce} \n`
						+`Energy to offspring: ${targetCreature.offSpringEnergy} \n`
						+`Spawn max Distance: ${targetCreature.spawnMaxDistance} \n`
						+`Offspring size: ${targetCreature.offSpringSize} \n`
	}

	creatureStringify()
	{
		
		return `{` + super.creatureStringify()+`,"energy":${this.energy},"range":${this.range},"minToReproduce":${this.MinToReproduce},"offSpringEnergy":${this.offSpringEnergy}, "offSpringSize":${this.offSpringSize},"size":${this.size},"spawnDistance":${this.spawnMaxDistance},"mutationRate":${this.mutationRate} }`
	}

}


