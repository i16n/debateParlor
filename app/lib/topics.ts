export const debateTopics = [
  "AI",
  "College Education",
  "Space Exploration",
  "Voting",
  "Video Games",
  "Death Penalty",
  "Genetic Engineering",
  "Universal Basic Income",
  "Nuclear Energy",
  "Smartphones in Schools",
  "Online Privacy",
  "Animal Testing",
  "Capitalism",
  "Vaccinations",
  "Remote Work",
  "Legalization of Drugs",
  "Four-Day Work Week",
  "Self-Driving Cars",
  "Censorship",
];

export function getRandomTopic(): string {
  const randomIndex = Math.floor(Math.random() * debateTopics.length);
  return debateTopics[randomIndex];
}
