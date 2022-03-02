var Course = /** @class */ (function () {
    function Course(name, degree, grade, courseType, year) {
        this.name = name;
        this.degree = degree;
        this.grade = grade;
        this.courseType = courseType;
        this.year = year;
    }
    return Course;
}());
var form = document.forms.seiseki;
var formData = function (data) {
    data = data.replace(/\"/g, "");
    data = data.replace(/\r/g, "");
    data = data.replace(/\\/g, "");
    return data;
};
var getGradeList = function (courseList) {
    var gradeList = [0, 0, 0, 0, 0, 0, 0, 0];
    var gradeOrder = ["A+", "A", "B", "C", "D", "P", "F", "履修中"];
    var grade = "";
    var degree;
    var gradeIndex;
    for (var i = 0; i < courseList.length; i++) {
        grade = courseList[i].grade;
        degree = courseList[i].degree;
        gradeIndex = gradeOrder.indexOf(grade);
        gradeList[gradeIndex] += degree;
    }
    return gradeList;
};
var filterByYear = function (list, year) {
    return list.filter(function (course) { return course.year === year; });
};
var getGp = function (courseList) {
    var gp = 0;
    var degree = 0;
    var gradeIndex;
    var grade = "";
    var gradeOrder = ["A+", "A", "B", "C", "D"];
    var degreeList = [0, 0, 0, 0, 0];
    var multipleList = [4.3, 4, 3, 2, 0];
    for (var i = 0; i < courseList.length; i++) {
        grade = courseList[i].grade;
        degree = courseList[i].degree;
        gradeIndex = gradeOrder.indexOf(grade);
        degreeList[gradeIndex] += degree;
    }
    for (var i = 0; i < 5; i++) {
        gp += degreeList[i] * multipleList[i];
    }
    return gp;
};
var createLabels = function (list) {
    var l = list.map(function (x) { return String(x); });
    return [
        "A+ (".concat(l[0], "%)"),
        "A (".concat(l[1], "%)"),
        "B (".concat(l[2], "%)"),
        "C (".concat(l[3], "%)"),
        "D (".concat(l[4], "%)"),
        "P (".concat(l[5], "%)"),
        "F (".concat(l[6], "%)"),
        "履修中 (".concat(l[7], "%)"),
    ];
};
var getPercentage = function (l) {
    var getSum = function (l) { return l.reduce(function (a, x) { return a + x; }); };
    var sum = getSum(l);
    var percentageList = [];
    var value;
    l.forEach(function (n) {
        value = (n / sum) * 100;
        percentageList.push(Math.round(value * Math.pow(10, 1)) / Math.pow(10, 1));
    });
    return percentageList;
};
var getGPA = function (gp, degree) {
    return gp / degree;
};
var createGraph = function (gradeList) {
    var ctx = document.getElementById("chart");
    var percentageData = getPercentage(gradeList);
    var labels = createLabels(percentageData);
    var chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [
                {
                    backgroundColor: [
                        "#ff4500",
                        "#ff8c00",
                        "#4169e1",
                        "#ffff00",
                        "#008000",
                        "#ffc0cb",
                        "#4b0082",
                        "#808080",
                    ],
                    data: gradeList
                },
            ]
        },
        options: {
            title: {
                display: true,
                text: "あなたの成績"
            }
        }
    });
};
var createTable = function (courseList) {
    var ref = document.getElementById("courseTable");
    var grade;
    var table = document.createElement("table");
    var tmpList = [[], [], [], [], [], [], [], []];
    var gradeOrder = ["A+", "A", "B", "C", "D", "P", "F", "履修中"];
    var gradeColor = [
        "#FF9999",
        "#FFCC99",
        "#99CCFF",
        "#FFFF99",
        "#99FF99",
        "#FFCCD8",
        "#E599FF",
        "#CCCCCC",
    ];
    for (var i = 0; i < courseList.length; i++) {
        grade = courseList[i].grade;
        tmpList[gradeOrder.indexOf(grade)].push(courseList[i]);
    }
    //Create a new list ordered by grade
    var newCourseList = tmpList.reduce(function (newArr, elem) {
        return newArr.concat(elem);
    }, []);
    for (var i = 0; i < newCourseList.length; i++) {
        var row = table.insertRow();
        var cell1 = row.insertCell();
        cell1.innerText = newCourseList[i].name;
        var cell2 = row.insertCell();
        cell2.innerText = newCourseList[i].grade;
        cell1.style.backgroundColor =
            gradeColor[gradeOrder.indexOf(newCourseList[i].grade)];
        cell2.style.backgroundColor =
            gradeColor[gradeOrder.indexOf(newCourseList[i].grade)];
    }
    table.setAttribute("align", "center");
    ref.appendChild(table);
};
form.seiseki.addEventListener("change", function (e) {
    var res = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(res);
    reader.addEventListener("load", function () {
        var textData = reader.result;
        var data = formData(textData).split("\n");
        var splitedData;
        var courseList = [];
        var gpaCourseList = [];
        var tmpCourse;
        //Check the selected year
        var year = document.getElementById("nendo")
            .value;
        //Get the values of the checkboxes
        var isGraphChecked = (document.getElementById("graphCheck")).checked;
        var isGpaChecked = (document.getElementById("gpaCheck")).checked;
        for (var i = 0; i < data.length; i++) {
            splitedData = data[i].split(",");
            tmpCourse = new Course(splitedData[3], Number(splitedData[4]), splitedData[7], splitedData[8], splitedData[9]);
            var kyoushoku = tmpCourse.courseType === "D";
            if (kyoushoku && isGraphChecked) {
                courseList.push(tmpCourse);
            }
            if (kyoushoku && isGpaChecked) {
                gpaCourseList.push(tmpCourse);
            }
            if (!kyoushoku) {
                courseList.push(tmpCourse);
                gpaCourseList.push(tmpCourse);
            }
        }
        //Remove the header
        courseList.shift();
        gpaCourseList.shift();
        //Filtering by year
        if (year !== "all") {
            courseList = filterByYear(courseList, year);
            gpaCourseList = filterByYear(gpaCourseList, year);
        }
        //Check if the course lists are not empty
        try {
            if (!courseList.length || !gpaCourseList.length) {
                throw new Error("授業が存在しません");
            }
        }
        catch (e) {
            alert(e.message);
            document.location.reload();
        }
        var degree = 0;
        //Calculate the number of degree
        for (var i = 0; i < gpaCourseList.length; i++) {
            if (["A+", "A", "B", "C", "D"].indexOf(gpaCourseList[i].grade) !== -1) {
                degree += Number(gpaCourseList[i].degree);
            }
        }
        var gradeList = getGradeList(courseList);
        var gp = getGp(gpaCourseList);
        createGraph(gradeList);
        courseList.pop();
        var gpa = Math.round(getGPA(gp, degree) * Math.pow(10, 2)) / Math.pow(10, 2);
        var message1 = courseList.length + "個の授業が検出されました";
        var message2 = " あなたのGPA(小数点第2位で四捨五入、P/F評価、履修中の科目は除外、教職以外のGPA対象外科目の除外には対応していません)";
        document.getElementById("message1").innerHTML = message1;
        document.getElementById("message2").innerHTML = message2;
        document.getElementById("gpa").innerHTML = String(gpa);
        document.getElementById("selection").innerHTML = "";
        //Create table
        createTable(courseList);
    });
});
