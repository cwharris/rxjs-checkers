moves = new Rx.Subject()

make2dArray = (w, h, f) ->

	a = []

	for x in [0...w]
		for y in [0...h]
			a[x] ?= []
			a[x][y] = f x, y

	a

Grid = (w, h) ->
	grid = {}
	grid.units = make2dArray w, h, (x, y) -> new GridUnit grid, x, y

	grid.each = (f) ->
		f grid.units[x][y], x, y for x in [0...w] for y in [0...h]

	grid

GridView = (grid) ->
	dom = $('<div>').addClass('grid')

	grid.each (unit) ->
		dom.append new GridUnitView unit

	dom

GridUnit = (grid, x, y) ->
	unit = 
		grid: grid
		x: x
		y: y
		piece: new Rx.BehaviorSubject null

	unit.piece.where((x) -> x? and x.unit.value != unit).subscribe (x) ->
		x.unit.onNext unit

	unit

GridUnitView = (gridUnit) ->
	dom = $('<div>').addClass('grid-unit')
	# dom.removeClass (i, cls) -> cls.replace /(col|row)-[0-9]+/g, ''
	dom.addClass "col-#{gridUnit.x}"
	dom.addClass "row-#{gridUnit.y}"
	dom.toggleClass 'odd', gridUnit.x % 2 isnt 0 or gridUnit.y % 2 isnt 0
	dom.toggleClass 'even', gridUnit.x % 2 is 0 or gridUnit.y % 2 is 0

	gridUnit.piece.subscribe (value) ->
		dom.toggleClass 'occupied', value isnt null

	dom

Piece = (team, unit = null) ->
	piece = 
		team: team
		kinged: new Rx.BehaviorSubject false
		unit: new Rx.BehaviorSubject unit

	piece.unit.where((x) -> x? and x.piece.value != piece).subscribe (x) ->
		x.piece.onNext piece

	piece

PieceView = (piece) ->
	dom = $('<div>').addClass('piece').addClass("team-#{piece.team}")

	dom.onAsObservable('click').subscribe (e) ->
		unit = piece.unit.value
		next = unit.grid.units[unit.x][unit.y+1]

		piece.unit.onNext next

	piece.kinged.subscribe (value) ->
		dom.toggleClass 'kinged', value

	piece.unit.subscribe (value) ->
		# dom.removeClass (i, cls) -> 'hey'
		dom.addClass "col-#{value.x}"
		dom.addClass "row-#{value.y}"

	dom

grid = new Grid 8, 8

$ ->

	body = $ 'body'

	body.append gridView = new GridView grid

	grid.each (unit, x, y) ->
		return if (x + y) % 2 == 0 or (y > 1 and y < 6)

		team = if y >= 4 then 'black' else 'red'

		piece = new Piece team, unit

		gridView.append new PieceView piece