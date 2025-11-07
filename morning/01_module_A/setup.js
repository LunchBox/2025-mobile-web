for (let i = 1; i < 8; i++)
  fetch(`https://course-dummy-api-nine.vercel.app/courses/page-${i}.json`) // fetch the data
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      courses.push(JSON.parse(data));
      for (let page of courses) {
        for (let item of page["courses"]) {
          course_dict[item["c_title"].trim()] = item;
        }
      }
    })
    .catch((error) => {
      console.error("Error loading file:", error);
    });
