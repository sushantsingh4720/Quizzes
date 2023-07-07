import Quizze from "../models/quizze.js";
const createQuiz = async (req, res) => {
  try {
    const quizze = await Quizze.create({ ...req.body, user: req.user._id });

    res
      .status(201)
      .json({ success: true, message: "quizze is create successfully" });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
const getActiveQuizzes = async (req, res) => {
  try {
    const quizzes = await Quizze.find(
      {
        status: "inactive",
      },
      { _id: 1, question: 1 }
    );
    // console.log(quizzes);
    res.status(200).json({ success: true, activeQuizzes: quizzes });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
const allQuizzes = async (req, res) => {
  try {
    const quizzes = await Quizze.find({}, { _id: 1, question: 1 });

    res.status(200).json({ success: true, allQuizzes: quizzes });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
const getResultOfQuize = async (req, res) => {
  try {
    const quizze = await Quizze.findById(req.params.id);
    if (!quizze) {
      return res.status(404).send({ error: true, message: "Not Found" });
    }
    const differenceInMilliseconds = new Date() - quizze.endDate;
    const differenceInMinutes = Math.floor(
      (differenceInMilliseconds % 3600000) / 60000
    );
    if (quizze.status !== "finished" || differenceInMinutes < 5) {
      return res.status(404).json({
        error: true,
        message:
          "Quizze status is not finished or You can see result After the 5 minute of end time of a quiz",
      });
    }
    res
      .status(200)
      .json({ success: true, result: quizze.options[quizze.rightAnswer] });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

export { createQuiz, getActiveQuizzes, allQuizzes, getResultOfQuize };
