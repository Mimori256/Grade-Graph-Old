const form = document.forms.seiseki;

const formData = (data) => {
  data = data.replace(/\"/g, "");
  data = data.replace(/\r/g, "");
  data = data.replace(/\\/g, "");
  return data;
};

const getGradeList = (courseList) => {
  let ap = 0,
    a = 0,
    b = 0,
    c = 0,
    d = 0,
    p = 0,
    f = 0,
    pending = 0;
  let grade = "";

  for (let i = 0; i < courseList.length; i++) {
    grade = courseList[i][7];

    switch (grade) {
      case "A+":
        ap++;
        break;
      case "A":
        a++;
        break;
      case "B":
        b++;
        break;
      case "C":
        c++;
        break;
      case "D":
        d++;
        break;
      case "P":
        p++;
        break;
      case "F":
        f++;
        break;
      case "履修中":
        pending++;
        break;
    }
  }
  return [ap, a, b, c, d, p, f, pending];
};

const filterByYear = (list, year) => {
  return list.filter((course) => course[9] === year);
};

const getGp = (courseList) => {
  let gp = 0;
  let degree = 0;
  let grade = "";

  for (let i = 0; i < courseList.length; i++) {
    grade = courseList[i][7];
    degree = Number(courseList[i][4]);

    switch (grade) {
      case "A+":
        gp = gp + 4.3 * degree;
        break;
      case "A":
        gp = gp + 4 * degree;
        break;
      case "B":
        gp = gp + 3 * degree;
        break;
      case "C":
        gp = gp + 2 * degree;
        break;
    }
  }
  return gp;
};

const createLabels = (l) => {
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

const getPercentage = (l) => {
  const getSum = (l) => l.reduce((a, x) => a + x);
  const sum = getSum(l);
  const percentageList = [];
  let value;

  l.forEach((n) => {
    value = (n / sum) * 100;
    percentageList.push(Math.round(value * Math.pow(10, 1)) / Math.pow(10, 1));
  });
  return percentageList;
};

const createGraph = (gradeList) => {
  const ctx = document.getElementById("chart");
  const percentageData = getPercentage(gradeList);
  const labels = createLabels(percentageData);
  const chart = new Chart(ctx, {
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
          data: gradeList,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "あなたの成績",
      },
    },
  });
  chart.update();
};

const getGPA = (gp, degree) => {
  return gp / degree;
};

const createTable = (courseList) => {
  const ref = document.getElementById("courseTable");
  let table = document.createElement("table");
  const gradeOrder = ["A+", "A", "B", "C", "D", "P", "F", "履修中"];
  const gradeColor = [
    "#FF9999",
    "#FFCC99",
    "#99CCFF",
    "#FFFF99",
    "#99FF99",
    "#FFCCD8",
    "#E599FF",
    "#CCCCCC",
  ];

  //Sort course list
  const compare = (a, b) => {
    return gradeOrder.indexOf(a[7]) > gradeOrder.indexOf(b[7]);
  };

  courseList.sort(compare);

  for (let i = 0; i < courseList.length; i++) {
    let row = table.insertRow();

    let cell1 = row.insertCell();
    cell1.innerText = courseList[i][3];

    let cell2 = row.insertCell();
    cell2.innerText = courseList[i][7];

    cell1.style.backgroundColor =
      gradeColor[gradeOrder.indexOf(courseList[i][7])];
    cell2.style.backgroundColor =
      gradeColor[gradeOrder.indexOf(courseList[i][7])];
  }

  table.setAttribute("align", "center");

  ref.appendChild(table);
};

form.seiseki.addEventListener("change", function (e) {
  const res = e.target.files[0];
  const reader = new FileReader();
  reader.readAsText(res);
  reader.addEventListener("load", function () {
    const data = formData(reader.result).split("\n");
    let courseList = [];
    let gpaCourseList = [];

    //Check the selected year
    let year = document.getElementById("nendo").value;

    //Get the values of the checkboxes
    const isGraphChecked = document.getElementById("graphCheck").checked;
    const isGpaChecked = document.getElementById("gpaCheck").checked;

    for (let i = 0; i < data.length; i++) {
      if (data[i].split(",")[8] === "D" && isGraphChecked) {
        courseList.push(data[i].split(","));
      }

      if (data[i].split(",")[8] === "D" && isGpaChecked) {
        gpaCourseList.push(data[i].split(","));
      }

      if (data[i].split(",")[8] !== "D") {
        courseList.push(data[i].split(","));
        gpaCourseList.push(data[i].split(","));
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
    } catch (e) {
      alert(e.message);
      document.location.reload();
    }

    let degree = 0;

    //Calculate the number of degree
    for (let i = 0; i < gpaCourseList.length; i++) {
      if (["A+", "A", "B", "C", "D"].indexOf(gpaCourseList[i][7]) !== -1) {
        degree = degree + Number(gpaCourseList[i][4]);
      }
    }

    const gradeList = getGradeList(courseList);
    const gp = getGp(gpaCourseList);

    createGraph(gradeList);

    const gpa =
      Math.round(getGPA(gp, degree) * Math.pow(10, 2)) / Math.pow(10, 2);
    const message1 = courseList.length - 1 + "個の授業が検出されました";
    const message2 =
      " あなたのGPA(小数点第2位で四捨五入、P/F評価、履修中の科目は除外、教職以外のGPA対象外科目の除外には対応していません)";
    document.getElementById("message1").innerHTML = message1;
    document.getElementById("message2").innerHTML = message2;
    document.getElementById("gpa").innerHTML = String(gpa);
    document.getElementById("selection").innerHTML = "";

    //Create table
    courseList.pop();
    console.log(courseList);
    createTable(courseList);
  });
});
