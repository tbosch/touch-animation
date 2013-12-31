angular.module('demo', ['scroll']).
  controller('ScrollController', function() {
    var i;
    this.rows = [];
    this.addRows = function(count) {
      var i, row;
      for (i=0; i<count; i++) {
        row = {index: this.rows.length, text: 'todo no '+this.rows.length};
        // row.clicked = i % 3 === 0;
        this.rows.push(row);

      }
    };
    this.addRows(40);
    this.delete = function(row) {
      var i;
      for (i=0; i<this.rows.length; i++) {
        if (this.rows[i] === row) {
          this.rows.splice(i, 1);
          return;
        }
      }
    }
  });