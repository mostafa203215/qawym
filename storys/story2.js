function choose(option) {
  const storyText = document.getElementById("story-text");
  const choices = document.getElementById("choices");

  if (option === "goVillage") {
    storyText.textContent =
      "الثعلب ذهب إلى القرية فوجد بيتًا مشتعلًا! والأطفال يصرخون طلبًا للمساعدة. ماذا يفعل؟";
    choices.innerHTML = `
      <button onclick="choose('help')">يحاول مساعدة الأطفال</button>
      <button onclick="choose('findHelp')">يجري ليطلب مساعدة الكبار</button>
    `;
  } else if (option === "ignore") {
    storyText.textContent =
      "الثعلب تجاهل الدخان وعاد للغابة، لكن في اليوم التالي علم أن القرية تضررت كثيرًا. شعر بالذنب لأنه لم يساعد. النهاية.";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  } else if (option === "help") {
    storyText.textContent =
      "الثعلب دخل البيت وحاول إنقاذ الأطفال، لكنه كان صغيرًا ولا يستطيع وحده. الأطفال ما زالوا محاصرين.";
    choices.innerHTML = `
      <button onclick="choose('callHelpLate')">يذهب متأخرًا ليطلب المساعدة</button>
      <button onclick="choose('tryAlone')">يحاول وحده رغم الخطر</button>
    `;
  } else if (option === "findHelp") {
    storyText.textContent =
      "الثعلب جرى بسرعة إلى ساحة القرية ونادى الكبار. اجتمعوا جميعًا ومعهم الماء والأدوات. استطاعوا إطفاء الحريق وإنقاذ الأطفال. 🎉";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  } else if (option === "callHelpLate") {
    storyText.textContent =
      "الثعلب تأخر قليلًا في طلب المساعدة، وعندما عاد كان الحريق قد كبر وصار أصعب. تعلم أنه يجب طلب المساعدة بسرعة.";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  } else if (option === "tryAlone") {
    storyText.textContent =
      "الثعلب حاول وحده لكن النار كانت قوية جدًا، وكاد أن يتأذى. لحسن الحظ وصل القرويون في الوقت المناسب وأنقذوا الجميع. تعلم أن التعاون أهم من الشجاعة الفردية.";
    choices.innerHTML = `<button onclick="restart()">إعادة القصة</button>`;
  }
}

function restart() {
  document.getElementById("story-text").textContent =
    "في قديم الزمان كان هناك ثعلب طيب يعيش بالقرب من قرية صغيرة.  في يوم من الأيام رأى دخانًا يخرج من بيوت القرية.  شعر الثعلب بالقلق، فكر: ماذا يفعل؟";
  document.getElementById("choices").innerHTML = `
    <button onclick="choose('goVillage')">يذهب بسرعة إلى القرية</button>
    <button onclick="choose('ignore')">يتجاهل ويعود للغابة</button>
  `;
}
