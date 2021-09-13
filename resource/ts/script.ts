class Course {
  name: string;
  degree: number;
  grade: string;
  courseType: string;
  year: string;

  constructor(
    name: string,
    degree: number,
    grade: string,
    courseType: string,
    year: string
  ) {
    this.name = name;
    this.degree = degree;
    this.grade = grade;
    this.courseType = courseType;
    this.year = year;
  }
}

const form = document.forms.seiseki;

const formData = (data: string): string => {
  data = data.replace(/\"/g, "");
  data = data.replace(/\r/g, "");
  data = data.replace(/\\/g, "");
  return data;
};

const getGradeList = (courseList: Course[]): number[] => {
  let gradeList: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  const gradeOrder: string[] = ["A+", "A", "B", "C", "D", "P", "F", "履修中"];

  let grade: string = "";
  let gradeIndex: number;

  for (let i: number = 0; i < courseList.length; i++) {
    grade = courseList[i].grade;
    gradeIndex = gradeOrder.indexOf(grade);
    gradeList[gradeIndex]++;
  }
  return gradeList;
};

const filterByYear = (list: Course[], year: String): Course[] => {
  return list.filter((course) => course.year === year);
};

const getGp = (courseList: Course[]): number => {
  let gp: number = 0;
  let degree: number = 0;
  let gradeIndex: number;
  let grade: string = "";

  const gradeOrder: string[] = ["A+", "A", "B", "C", "D"];
  let degreeList: number[] = [0, 0, 0, 0, 0];
  const multipleList: number[] = [4.3, 4, 3, 2, 0];

  for (let i: number = 0; i < courseList.length; i++) {
    grade = courseList[i].grade;
    degree = courseList[i].degree;
    gradeIndex = gradeOrder.indexOf(grade);
    degreeList[gradeIndex] += degree;
  }

  for (let i: number = 0; i < 5; i++) {
    gp += degreeList[i] * multipleList[i];
  }
  return gp;
};

const createLabels = (list: number[]): string[] => {
  const l: string[] = list.map((x) => String(x));
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

const getPercentage = (l: number[]): number[] => {
  const getSum = (l: number[]) => l.reduce((a, x) => a + x);
  const sum: number = getSum(l);
  let percentageList: number[] = [];
  let value: number;

  l.forEach((n: number) => {
    value = (n / sum) * 100;
    percentageList.push(Math.round(value * Math.pow(10, 1)) / Math.pow(10, 1));
  });
  return percentageList;
};

const getGPA = (gp: number, degree: number): number => {
  return gp / degree;
};

const createGraph = (gradeList: number[]): void => {
  const ctx = <HTMLCanvasElement>document.getElementById("chart");
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
};

const createTable = (courseList: Course[]): void => {
  const ref = <HTMLInputElement>document.getElementById("courseTable");
  let grade: string;
  let table = document.createElement("table");
  let tmpList: Course[][] = [[], [], [], [], [], [], [], []];
  const gradeOrder: string[] = ["A+", "A", "B", "C", "D", "P", "F", "履修中"];
  const gradeColor: string[] = [
    "#FF9999",
    "#FFCC99",
    "#99CCFF",
    "#FFFF99",
    "#99FF99",
    "#FFCCD8",
    "#E599FF",
    "#CCCCCC",
  ];

  for (let i = 0; i < courseList.length; i++) {
    grade = courseList[i].grade;
    tmpList[gradeOrder.indexOf(grade)].push(courseList[i]);
  }

  //Create a new list ordered by grade
  let newCourseList: Course[] = tmpList.reduce((newArr, elem) => {
    return newArr.concat(elem);
  }, []);

  for (let i: number = 0; i < newCourseList.length; i++) {
    let row = table.insertRow();

    let cell1 = row.insertCell();
    cell1.innerText = newCourseList[i].name;

    let cell2 = row.insertCell();
    cell2.innerText = newCourseList[i].grade;

    cell1.style.backgroundColor =
      gradeColor[gradeOrder.indexOf(newCourseList[i].grade)];
    cell2.style.backgroundColor =
      gradeColor[gradeOrder.indexOf(newCourseList[i].grade)];
  }

  table.setAttribute("align", "center");

  ref.appendChild(table);
};

form.seiseki.addEventListener("change", function (e: any) {
  const res = e.target.files[0];
  const reader = new FileReader();
  reader.readAsText(res);
  reader.addEventListener("load", function () {
    const textData: any = reader.result;
    const data: string[] = formData(textData).split("\n");
    let splitedData: string[];
    let courseList: Course[] = [];
    let gpaCourseList: Course[] = [];
    let tmpCourse: Course;

    //Check the selected year
    let year: string = (<HTMLInputElement>document.getElementById("nendo"))
      .value;

    //Get the values of the checkboxes
    const isGraphChecked: boolean = (<HTMLInputElement>(
      document.getElementById("graphCheck")
    )).checked;
    const isGpaChecked: boolean = (<HTMLInputElement>(
      document.getElementById("gpaCheck")
    )).checked;

    for (let i = 0; i < data.length; i++) {
      splitedData = data[i].split(",");
      tmpCourse = new Course(
        splitedData[3],
        Number(splitedData[4]),
        splitedData[7],
        splitedData[8],
        splitedData[9]
      );

      const kyoushoku: boolean = tmpCourse.courseType === "D";

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
    } catch (e: any) {
      alert(e.message);
      document.location.reload();
    }

    let degree: number = 0;

    //Calculate the number of degree
    for (let i: number = 0; i < gpaCourseList.length; i++) {
      if (["A+", "A", "B", "C", "D"].indexOf(gpaCourseList[i].grade) !== -1) {
        degree += Number(gpaCourseList[i].degree);
      }
    }

    const gradeList: number[] = getGradeList(courseList);
    const gp: number = getGp(gpaCourseList);

    createGraph(gradeList);

    courseList.pop();
    const gpa: number =
      Math.round(getGPA(gp, degree) * Math.pow(10, 2)) / Math.pow(10, 2);
    const message1 = courseList.length + "個の授業が検出されました";
    const message2 =
      " あなたのGPA(小数点第2位で四捨五入、P/F評価、履修中の科目は除外、教職以外のGPA対象外科目の除外には対応していません)";
    document.getElementById("message1")!.innerHTML = message1;
    document.getElementById("message2")!.innerHTML = message2;
    document.getElementById("gpa")!.innerHTML = String(gpa);
    document.getElementById("selection")!.innerHTML = "";

    //Create table
    createTable(courseList);
  });
});
