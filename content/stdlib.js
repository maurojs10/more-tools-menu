// **************************************************************************
// Copyright 2007 - 2009 Tavs Dokkedahl
// Contact: http://www.jslab.dk/contact.php
//
// This file is part of the JSLab Standard Library (JSL) Program.
//
// JSL is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 3 of the License, or
// any later version.
//
// JSL is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.
// ***************************************************************************
// File created 2012-02-11 01:45:51

// Return elements which are in A but not in arg0 through argn
Array.prototype.diff =
  function() {
    var a1 = this;
    var a = a2 = null;
    var n = 0;
    while(n < arguments.length) {
      a = [];
      a2 = arguments[n];
      var l = a1.length;
      var l2 = a2.length;
      var diff = true;
      for(var i=0; i<l; i++) {
        for(var j=0; j<l2; j++) {
          if (a1[i] === a2[j]) {
            diff = false;
            break;
          }
        }
        diff ? a.push(a1[i]) : diff = true;
      }
      a1 = a;
      n++;
    }
    return a.unique();
  };

// Get the union of n arrays
Array.prototype.union =
  function() {
    var a = [].concat(this);
    var l = arguments.length;
    for(var i=0; i<l; i++) {
      a = a.concat(arguments[i]);
    }
    return a.unique();
  };

// Return new array with duplicate values removed
Array.prototype.unique =
  function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
    }
    return a;
  };

// Return a new string without leading and trialing whitespace
String.prototype.trim =
  function() {
    return this.replace(/^\s*?(\S*?)\s*$/,'$1');
  };

