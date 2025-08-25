export type Category = 'obstetrics' | 'gynecology';

export interface Flashcard {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

export const flashcards: Flashcard[] = [
  // Obstetrics Cards
  {
    id: '1',
    category: 'obstetrics',
    question: 'What is the normal duration of pregnancy?',
    answer: '280 days or 40 weeks from the last menstrual period (LMP), or 266 days from conception.'
  },
  {
    id: '2',
    category: 'obstetrics',
    question: 'What are the cardinal movements of labor?',
    answer: '1. Engagement\n2. Descent\n3. Flexion\n4. Internal rotation\n5. Extension\n6. External rotation (restitution)\n7. Expulsion'
  },
  {
    id: '3',
    category: 'obstetrics',
    question: 'What is preeclampsia?',
    answer: 'A pregnancy complication characterized by high blood pressure (≥140/90 mmHg) and proteinuria (≥300mg/24hr) or other organ dysfunction after 20 weeks of gestation.'
  },
  {
    id: '4',
    category: 'obstetrics',
    question: 'What is the Bishop score used for?',
    answer: 'To assess cervical readiness for induction of labor. It evaluates cervical dilation, effacement, station, consistency, and position.'
  },
  {
    id: '5',
    category: 'obstetrics',
    question: 'What are the stages of labor?',
    answer: 'Stage 1: Onset of labor to full cervical dilation (10cm)\nStage 2: Full dilation to delivery of baby\nStage 3: Delivery of baby to delivery of placenta\nStage 4: First hour postpartum'
  },
  
  // Gynecology Cards
  {
    id: '6',
    category: 'gynecology',
    question: 'What is the normal menstrual cycle length?',
    answer: '21-35 days (average 28 days), with menstrual flow lasting 3-7 days and blood loss of 5-80ml.'
  },
  {
    id: '7',
    category: 'gynecology',
    question: 'What is endometriosis?',
    answer: 'A condition where endometrial tissue grows outside the uterine cavity, commonly causing dysmenorrhea, dyspareunia, and infertility.'
  },
  {
    id: '8',
    category: 'gynecology',
    question: 'What are the contraindications to combined oral contraceptive pills?',
    answer: 'Cardiovascular disease, thromboembolism history, stroke, migraines with aura, active liver disease, breast cancer, uncontrolled hypertension, smoking >35 years old.'
  },
  {
    id: '9',
    category: 'gynecology',
    question: 'What is polycystic ovary syndrome (PCOS)?',
    answer: 'A hormonal disorder characterized by irregular periods, hyperandrogenism, and polycystic ovaries. Diagnosed by Rotterdam criteria (2 of 3: oligo/anovulation, hyperandrogenism, polycystic ovaries).'
  },
  {
    id: '10',
    category: 'gynecology',
    question: 'What is the most common cause of abnormal uterine bleeding in reproductive age women?',
    answer: 'Anovulation, often due to PCOS, thyroid disorders, or stress. Other causes include fibroids, polyps, adenomyosis, and coagulopathy.'
  }
];

export const getCategoryCards = (category: Category): Flashcard[] => {
  return flashcards.filter(card => card.category === category);
};

export const getAllCards = (): Flashcard[] => {
  return flashcards;
};