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

const getGPA = (gradeList,degree) => {
  let count = 0;
  let gp = 0;

  for (let i = 0; i < 5; i++) {
    count = count + gradeList[i];
  }

  gp =
    gradeList[0] * 4.3 + gradeList[1] * 4 + gradeList[2] * 3 + gradeList[3] * 2;
  return gp / degree;
};

form.seiseki.addEventListener("change", function (e) {
  const res = e.target.files[0];
  const reader = new FileReader();
  reader.readAsText(res);
  reader.addEventListener("load", function () {
    const data = formData(reader.result).split("\n");
    const courseList = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].split(",")[8] != "D") {
        courseList.push(data[i].split(","));
      }
    }

    let degree = 0;

    for (let i=0; i<courseList.length; i++) {
      if (["A+","A","B","C","D"].indexOf(courseList[i][7]) != -1){
        degree = degree + Number(courseList[i][4]);
      }
    }

    //Remove the header
    courseList.shift();
    gradeList = getGradeList(courseList);
    createGraph(gradeList);

    const gpa =
      Math.round(getGPA(gradeList,degree) * Math.pow(10, 2)) / Math.pow(10, 2);
    const message1 = courseList.length + "個の授業が検出されました";
    const message2 =
      " あなたのGPA(小数点第2位で四捨五入、P/F評価、履修中の科目は除外、教職以外の対象外の科目は除外していません)";
    document.getElementById("message1").innerHTML = message1;
    document.getElementById("message2").innerHTML = message2;
    document.getElementById("gpa").innerHTML = gpa;
    document.getElementById("selection").innerHTML = "";
  });
});
