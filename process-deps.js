fs = require('fs');
process = require('process');

function readIt(path, file, loc) {
    var data = fs.readFileSync(path + '/' + file).toString();
    data = data.replaceAll('\r', '');

    var regex = new RegExp('[\s\S]*' + loc);
    var match = data.match(regex);
    if (match == null) {
        return [];
    }
    var left = data.substring(match.index);
    var teRegex = /<\/table>/;
    var matchEnd = left.match(teRegex);
    var care = left.substring(0, matchEnd.index);

    var end = /<\/th><\/tr>/;
    var careStart = care.match(end);

    var header = care.substring(0, careStart.index);
    care = care.substring(careStart.index);


    var hasClass = header.match(/Classifier/) !== null;


    // console.log(care);
    // require('process').exit();

// <tr class="b">
// <td>mil.nga.giat</td>
// <td><a class="externalLink" href="https://github.com/ngageoint/geowave/geowave-core-parent/geowave-core-geotime">geowave-core-geo
// time</a></td>
// <td>0.9.2-SNAPSHOT</td>
// <td>jar</td>
// <td><a class="externalLink" href="http://www.apache.org/licenses/LICENSE-2.0.txt">The Apache Software License, Version 2.0</a></t
// d></tr>

    care = care.replaceAll('<td>', '\n');
    care = care.replaceAll('</td>', '\n');

    console.log(loc + '=====' + file + '-------');
    care = care.split('\n');

    var loc = -1;
    var licLoc = hasClass ? 17 : 14;

    var group = '';
    var art = '';
    var ver = '';
    var lic = '';

    var url = /<a[^>]*>([^<]*)</;

    var alldeps = [];
    care.forEach(function(value) {
        //console.log(value);
        if (loc == -1 && value.startsWith('<tr ')) {
            loc = 0;
        }
        if (loc == 2) {
            group = value;
        }
        else if (loc == 5) {
            piece = value.match(url);
            if (piece !== null) {
                art = piece[1];
            }
            else {
                art = value;
            }
        }
        else if (loc == 8) {
            ver = value;
        }
        else if (loc == licLoc) {
            piece = value.match(url);
            if (piece !== null) {
                lic = piece[1];
            }
            else {
                lic = value;
            }
            if (lic == 'jar') {
                require('process').exit();
            }
            alldeps.push({
                group: group,
                art: art,
                ver: ver,
                lic: lic
            });
            loc = -1;
        }
        if (loc >= 0) {
            loc ++;
        }
    });


    // console.log(alldeps);
    return alldeps;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var path = 'C:\\workspace\\geowave\\deps\\tools-cloudera';
var paramFiles = fs.readdirSync(path);

var compile = {};
var test = {};

function addTo(input, list) {
    input.forEach(function(item) {
        var key = item.group + ':'+ item.art + ':' + item.ver;
        if (!list[key]) {
            list[key] = input;
        }
    });
}

for (var i = 0; i < paramFiles.length; i++) {
    if (!paramFiles[i].endsWith('.html')) {
        continue;
    }
    console.log(paramFiles[i]);
    var out1 = readIt(path, paramFiles[i], 'Project_Dependencies_compile');
    var out2 = readIt(path, paramFiles[i], 'Project_Dependencies_test');
    var out3 = readIt(path, paramFiles[i], 'Project_Transitive_Dependencies_compile');
    var out4 = readIt(path, paramFiles[i], 'Project_Transitive_Dependencies_test');

    addTo(out1, compile);
    addTo(out2, test);
    addTo(out3, compile);
    addTo(out4, test);


//    console.log(out3);

    //break;

}

console.log(compile);


    // var out = readIt(path, paramFiles[i]);
    // var parts = out.data;
    // var j = 0;

    // while (j < parts.length) {
    //     var name = parts[j++].trim();
    //     var type = parts[j++].trim();
    //     var shortName = parts[j++].trim();
    //     var description = parts[j++].trim();
    //     var crap = parts[j++].trim();

    //     name = name.substring(0,name.length - 1);
    //     type = type.substring(0,type.length - 7);
    //     shortName = shortName.substring(1,shortName.length - 2);
    //     description = description.substring(1,description.length - 2);

    //     camelName = name.replaceAll('_', ' ').toLowerCase();
    //     camelName = camelize(camelName);

    //     var longName = camelName;

    //     //console.log('@Parameter(names = {"-' + shortName + '", "--' + longName + '"}, description = "' + description + '")');
    //     //console.log('private ' + type + ' ' + longName + ';')
    //     //console.log('')
    //     allData += "'" + out.family + '.' + out.title + '.' + name + "': { "
    //         + "'shortName': '" + shortName + "', "
    //         + "'longName': '" + longName + "', "
    //         + "'description': '" + description + "', "
    //         + "'type': '" + type + "' "
    //         + "},\n";
    // }


// }

// fs.writeFileSync("all_data.js", "module.exports = { \n" + allData + "};");

require('process').exit();




