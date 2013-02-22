// Generated by CoffeeScript 1.4.0
(function() {
  var Grid, GridUnit, GridUnitView, GridView, Piece, PieceView, grid, make2dArray, moves;

  moves = new Rx.Subject();

  make2dArray = function(w, h, f) {
    var a, x, y, _i, _j, _ref;
    a = [];
    for (x = _i = 0; 0 <= w ? _i < w : _i > w; x = 0 <= w ? ++_i : --_i) {
      for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
        if ((_ref = a[x]) == null) {
          a[x] = [];
        }
        a[x][y] = f(x, y);
      }
    }
    return a;
  };

  Grid = function(w, h) {
    var grid;
    grid = {};
    grid.units = make2dArray(w, h, function(x, y) {
      return new GridUnit(grid, x, y);
    });
    grid.each = function(f) {
      var x, y, _i, _results;
      _results = [];
      for (y = _i = 0; 0 <= h ? _i < h : _i > h; y = 0 <= h ? ++_i : --_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (x = _j = 0; 0 <= w ? _j < w : _j > w; x = 0 <= w ? ++_j : --_j) {
            _results1.push(f(grid.units[x][y], x, y));
          }
          return _results1;
        })());
      }
      return _results;
    };
    return grid;
  };

  GridView = function(grid) {
    var dom;
    dom = $('<div>').addClass('grid');
    grid.each(function(unit) {
      return dom.append(new GridUnitView(unit));
    });
    return dom;
  };

  GridUnit = function(grid, x, y) {
    var unit;
    unit = {
      grid: grid,
      x: x,
      y: y,
      piece: new Rx.BehaviorSubject(null)
    };
    unit.piece.where(function(x) {
      return (x != null) && x.unit.value !== unit;
    }).subscribe(function(x) {
      return x.unit.onNext(unit);
    });
    return unit;
  };

  GridUnitView = function(gridUnit) {
    var dom;
    dom = $('<div>').addClass('grid-unit');
    dom.addClass("col-" + gridUnit.x);
    dom.addClass("row-" + gridUnit.y);
    dom.toggleClass('odd', gridUnit.x % 2 !== 0 || gridUnit.y % 2 !== 0);
    dom.toggleClass('even', gridUnit.x % 2 === 0 || gridUnit.y % 2 === 0);
    gridUnit.piece.subscribe(function(value) {
      return dom.toggleClass('occupied', value !== null);
    });
    return dom;
  };

  Piece = function(team, unit) {
    var piece;
    if (unit == null) {
      unit = null;
    }
    piece = {
      team: team,
      kinged: new Rx.BehaviorSubject(false),
      unit: new Rx.BehaviorSubject(unit)
    };
    piece.unit.where(function(x) {
      return (x != null) && x.piece.value !== piece;
    }).subscribe(function(x) {
      return x.piece.onNext(piece);
    });
    return piece;
  };

  PieceView = function(piece) {
    var dom;
    dom = $('<div>').addClass('piece').addClass("team-" + piece.team);
    dom.onAsObservable('click').subscribe(function(e) {
      var next, unit;
      unit = piece.unit.value;
      next = unit.grid.units[unit.x][unit.y + 1];
      return piece.unit.onNext(next);
    });
    piece.kinged.subscribe(function(value) {
      return dom.toggleClass('kinged', value);
    });
    piece.unit.subscribe(function(value) {
      dom.addClass("col-" + value.x);
      return dom.addClass("row-" + value.y);
    });
    return dom;
  };

  grid = new Grid(8, 8);

  $(function() {
    var body, gridView;
    body = $('body');
    body.append(gridView = new GridView(grid));
    return grid.each(function(unit, x, y) {
      var piece, team;
      if ((x + y) % 2 === 0 || (y > 1 && y < 6)) {
        return;
      }
      team = y >= 4 ? 'black' : 'red';
      piece = new Piece(team, unit);
      return gridView.append(new PieceView(piece));
    });
  });

}).call(this);