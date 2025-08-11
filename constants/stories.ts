import { subscriptionService } from '../services/SubscriptionService';

export interface StoryCharacter {
  id: string;
  name: string;
  nameAr: string;
  type: 'superhero' | 'adventure' | 'fairy_tale' | 'educational' | 'animal' | 'space' | 'ocean' | 'forest';
  image: string;
  description: string;
  descriptionAr: string;
  isPremium: boolean;
}

export interface StoryTemplate {
  id: string;
  title: string;
  titleAr: string;
  characterId: string;
  category: 'adventure' | 'superhero' | 'educational' | 'fairy_tale' | 'friendship' | 'courage' | 'discovery';
  ageGroup: '3-5' | '6-8' | '9-12';
  duration: number; // بالدقائق
  isPremium: boolean;
  content: StoryContent[];
  moral: string;
  moralAr: string;
  keywords: string[];
  keywordsAr: string[];
}

export interface StoryContent {
  page: number;
  text: string;
  textAr: string;
  image?: string;
  childImagePlacement?: 'hero' | 'side' | 'background' | 'main';
  animation?: 'slideIn' | 'fadeIn' | 'bounce' | 'zoom' | 'celebration';
  soundEffect?: string;
  interactionType?: 'tap' | 'swipe' | 'shake' | 'voice';
  choices?: StoryChoice[];
}

export interface StoryChoice {
  id: string;
  text: string;
  textAr: string;
  outcome: 'positive' | 'negative' | 'neutral';
  nextPage?: number;
  points?: number;
}

// فئات القصص
export const STORY_CATEGORIES = [
  { id: 'superhero', name: 'Superheroes', nameAr: 'الأبطال الخارقون' },
  { id: 'adventure', name: 'Adventure', nameAr: 'المغامرات' },
  { id: 'educational', name: 'Educational', nameAr: 'تعليمية' },
  { id: 'fairy_tale', name: 'Fairy Tales', nameAr: 'الحكايات الخرافية' },
  { id: 'friendship', name: 'Friendship', nameAr: 'الصداقة' },
  { id: 'courage', name: 'Courage', nameAr: 'الشجاعة' },
  { id: 'discovery', name: 'Discovery', nameAr: 'الاستكشاف' }
];

// مجموعات العمر
export const AGE_GROUPS = [
  { id: '3-5', name: '3-5 years', nameAr: '3-5 سنوات' },
  { id: '6-8', name: '6-8 years', nameAr: '6-8 سنوات' },
  { id: '9-12', name: '9-12 years', nameAr: '9-12 سنة' }
];

// شخصيات القصص مع صور مناسبة للأطفال
export const STORY_CHARACTERS: StoryCharacter[] = [
  // أبطال خارقون (مجاني)
  {
    id: 'superman',
    name: 'Superman',
    nameAr: 'سوبرمان',
    type: 'superhero',
    image: '/stories/سوبرمان.png',
    description: 'The mighty hero who protects the world',
    descriptionAr: 'البطل القوي الذي يحمي العالم',
    isPremium: false
  },
  {
    id: 'spiderman',
    name: 'Spider-Man',
    nameAr: 'سبايدر مان',
    type: 'superhero',
    image: '/stories/سبايدر مان.png',
    description: 'The web-slinging neighborhood hero',
    descriptionAr: 'بطل الحي الذي يتأرجح بخيوط العنكبوت',
    isPremium: false
  },
  
  // أبطال خارقون (مدفوع)
  {
    id: 'batman',
    name: 'Batman',
    nameAr: 'باتمان',
    type: 'superhero',
    image: '/stories/باتمان.png',
    description: 'The dark knight who protects Gotham',
    descriptionAr: 'الفارس المظلم الذي يحمي جوثام',
    isPremium: true
  },
  {
    id: 'wonder_woman',
    name: 'Wonder Woman',
    nameAr: 'المرأة المعجزة',
    type: 'superhero',
     image: '/stories/superhero1.svg',
    description: 'The Amazon princess warrior',
    descriptionAr: 'أميرة الأمازون المحاربة',
    isPremium: true
  },
  
  // شخصيات مغامرات (مجاني)
  {
    id: 'sinbad',
    name: 'Sinbad',
    nameAr: 'سندباد',
    type: 'adventure',
    image: '/stories/سندباد.png',
    description: 'The legendary sailor and adventurer',
    descriptionAr: 'البحار والمغامر الأسطوري',
    isPremium: false
  },
  {
    id: 'explorer',
    name: 'Young Explorer',
    nameAr: 'المستكشف الصغير',
    type: 'adventure',
     image: '/stories/adventure1.svg',
    description: 'A brave young adventurer',
    descriptionAr: 'مغامر صغير شجاع',
    isPremium: false
  },
  
  // شخصيات مغامرات (مدفوع)
  {
    id: 'pirate_captain',
    name: 'Pirate Captain',
    nameAr: 'قبطان القراصنة',
    type: 'adventure',
     image: '/stories/adventure1.svg',
    description: 'A treasure-hunting pirate captain',
    descriptionAr: 'قبطان قراصنة يبحث عن الكنوز',
    isPremium: true
  },
  {
    id: 'space_explorer',
    name: 'Space Explorer',
    nameAr: 'مستكشف الفضاء',
    type: 'space',
     image: '/stories/adventure.svg',
    description: 'An astronaut exploring the cosmos',
    descriptionAr: 'رائد فضاء يستكشف الكون',
    isPremium: true
  },
  
  // شخصيات الحيوانات (مجاني)
  {
    id: 'lion_king',
    name: 'Lion King',
    nameAr: 'ملك الغابة',
    type: 'animal',
    image: '/stories/أسد.png',
    description: 'The brave king of the jungle',
    descriptionAr: 'الملك الشجاع للغابة',
    isPremium: false
  },
  
  // شخصيات الحيوانات (مدفوع)
  {
    id: 'dolphin_friend',
    name: 'Dolphin Friend',
    nameAr: 'صديق الدلفين',
    type: 'ocean',
     image: '/stories/animal.svg',
    description: 'A friendly dolphin guide',
    descriptionAr: 'دلفين صديق ومرشد',
    isPremium: true
  },
  {
    id: 'dragon_rider',
    name: 'Dragon Rider',
    nameAr: 'راكب التنين',
    type: 'fairy_tale',
     image: '/stories/fairy.svg',
    description: 'A brave dragon rider',
    descriptionAr: 'فارس التنين الشجاع',
    isPremium: true
  }
];

// فتح جميع القصص وإضافة صور كرتونية محلية وعدم التكرار
export const FREE_STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'superman_city_rescue',
    title: 'Superman and {childName}: City Rescue Mission',
    titleAr: 'سوبرمان و{childName}: مهمة إنقاذ المدينة',
    characterId: 'superman',
    category: 'superhero',
    ageGroup: '6-8',
    duration: 8,
    isPremium: false,
    moral: 'Helping others and working together makes us stronger',
    moralAr: 'مساعدة الآخرين والعمل معاً يجعلنا أقوى',
    keywords: ['heroism', 'teamwork', 'courage', 'helping'],
    keywordsAr: ['البطولة', 'العمل الجماعي', 'الشجاعة', 'المساعدة'],
    content: [
      {
        page: 1,
        text: 'In the bustling city of Metropolis, a young hero named {childName} was playing in the park when suddenly, the ground began to shake violently. Buildings started to tremble, and people ran in panic. High above in the sky, Superman heard the commotion and flew down to investigate. "Hello there, brave {childName}!" Superman said with a warm smile. "I could use a helper today. Would you like to join me on a very important mission to save our city?" {childName} looked up at the mighty superhero with excitement and nodded eagerly. Superman gently lifted {childName} into his strong arms, and together they soared into the bright blue sky, ready to face whatever danger awaited them.',
        textAr: 'في مدينة مزدحمة، كان {childName} يلعب في الحديقة. سمع سوبرمان بعض الضجيج وطار ليرى ما يحدث. قال بابتسامة: "مرحباً يا {childName}! هل تساعدني اليوم؟" فرح {childName} كثيراً، ووافق بسرعة. حمله سوبرمان برفق، وطارا معاً في السماء الجميلة.',
        image: '/stories/superhero.svg',
        childImagePlacement: 'hero',
        animation: 'slideIn',
        soundEffect: 'whoosh'
      },
      {
        page: 2,
        text: 'As they flew over the city, {childName} spotted something strange near the downtown area. "Look, Superman!" {childName} pointed excitedly. "There\'s a huge robot causing all this trouble!" The giant robot was indeed wreaking havoc, lifting cars and throwing them around like toys. Superman nodded proudly at {childName}\'s keen observation. "Excellent spotting, {childName}! You have the eyes of a true hero. Now, I need you to help me think of a plan. The robot seems to be powered by a glowing crystal on its chest. If we can remove that crystal, we might be able to stop it. But we need to be very careful and work together." {childName} thought hard, feeling the weight of responsibility but also excitement at being trusted with such an important task.',
        textAr: 'وأثناء الطيران، رأى {childName} شيئاً غريباً. قال: "انظر يا سوبرمان! هناك روبوت كبير يسبب مشكلة". لاحظ سوبرمان ضوءاً في صدر الروبوت. قال: "إذا أزلنا هذا الضوء سنتوقف المشكلة. سنعمل معاً بهدوء".',
        image: '/stories/superhero.svg',
        childImagePlacement: 'side',
        animation: 'zoom',
        soundEffect: 'pop'
      },
      {
        page: 3,
        text: 'Superman carefully set {childName} down on a safe rooftop nearby. "I have an idea, Superman!" {childName} exclaimed. "What if I distract the robot while you fly around behind it? I could wave and shout to get its attention!" Superman\'s eyes lit up with admiration. "That\'s brilliant thinking, {childName}! You truly are a hero. But remember, stay on this safe rooftop and I\'ll protect you no matter what." With a brave heart, {childName} began jumping up and down, waving colorful flags they found on the rooftop. "Hey, Mr. Robot! Over here!" The giant robot turned its glowing red eyes toward {childName}, completely captivated by the brave little hero\'s fearless display. This was exactly the distraction Superman needed. With lightning speed, he flew behind the robot and reached for the crystal.',
        textAr: 'وضع سوبرمان {childName} على سطح آمن. قال {childName}: "سألوّح له حتى ينتبه لي". لوّح {childName} بيده، فنظر الروبوت إليه. عندها طار سوبرمان بسرعة نحو الضوء.',
        image: '/stories/superhero.svg',
        childImagePlacement: 'main',
        animation: 'bounce',
        soundEffect: 'chime'
      },
      {
        page: 4,
        text: 'With one swift movement, Superman grabbed the glowing crystal and crushed it in his powerful hands. Immediately, the robot stopped moving and gently powered down, falling to its knees harmlessly. The city was safe! Superman flew back to {childName} with the biggest smile. "We did it, {childName}! You were absolutely incredible. Your quick thinking and brave heart saved the entire city today." {childName} beamed with pride, feeling like a true superhero. As they flew back over the city, people looked up and cheered. "Thank you, Superman and {childName}!" they called out. That evening, as Superman flew {childName} home, he said, "Remember, {childName}, you don\'t need superpowers to be a hero. You have something even more special - a kind heart, a brave spirit, and the willingness to help others. That\'s what makes a real hero." {childName} smiled, knowing that this adventure would be remembered forever.',
        textAr: 'أمسك سوبرمان بالضوء وأطفأه، فتوقف الروبوت. قال سوبرمان: "أحسنت يا {childName}! ساعدتني كثيراً". عاد الناس سعداء. قال سوبرمان: "البطل هو من يملك قلباً طيباً ويساعد الآخرين". ابتسم {childName}.',
        image: '/stories/superhero.svg',
        childImagePlacement: 'hero',
        animation: 'celebration',
        soundEffect: 'celebration'
      }
    ]
  },
  {
    id: 'spiderman_school_adventure',
    title: 'Spider-Man and {childName}: The School Adventure',
    titleAr: 'سبايدر مان و{childName}: مغامرة المدرسة',
    characterId: 'spiderman',
    category: 'superhero',
    ageGroup: '3-5',
    duration: 6,
    isPremium: false,
    moral: 'Being helpful and kind makes everyone happy',
    moralAr: 'كونك مفيداً ولطيفاً يجعل الجميع سعداء',
    keywords: ['school', 'friendship', 'helping', 'kindness'],
    keywordsAr: ['المدرسة', 'الصداقة', 'المساعدة', 'اللطف'],
    content: [
      {
        page: 1,
        text: 'It was a beautiful morning at {childName}\'s school, and everyone was excited for the school fair. {childName} was helping set up decorations when suddenly, a strong wind blew through the playground, scattering all the colorful balloons and papers everywhere! The other children started to cry because all their hard work was being ruined. Just then, Spider-Man swung into the schoolyard, landing gracefully near {childName}. "Hey there, {childName}!" Spider-Man said cheerfully. "Looks like you could use some help with this windy situation. Want to team up with your friendly neighborhood Spider-Man?" {childName} nodded eagerly, excited to help save the school fair with their favorite superhero.',
        textAr: 'كان صباحاً جميلاً في مدرسة {childName}، وكان الجميع متحمسين لمعرض المدرسة. كان {childName} يساعد في تجهيز الزينة عندما هبت فجأة رياح قوية عبر الملعب، مبعثرة جميع البالونات الملونة والأوراق في كل مكان! بدأ الأطفال الآخرون في البكاء لأن كل عملهم الشاق كان يتدمر. في تلك اللحظة، تأرجح سبايدر مان في فناء المدرسة، هبط بأناقة بالقرب من {childName}. "مرحباً، {childName}!" قال سبايدر مان بمرح. "يبدو أنك تحتاج لبعض المساعدة مع هذا الوضع العاصف. تريد أن تتعاون مع سبايدر مان صديق الحي؟" أومأ {childName} بشغف، متحمس لمساعدة إنقاذ معرض المدرسة مع بطله الخارق المفضل.',
     image: '/stories/adventure1.svg',
        childImagePlacement: 'side',
        animation: 'slideIn',
        soundEffect: 'whoosh'
      },
      {
        page: 2,
        text: 'Spider-Man shot his webs up high to create a protective barrier around the schoolyard. "Great idea!" {childName} cheered. "Now the wind can\'t blow everything away!" Together, they began collecting all the scattered decorations. {childName} was amazingly fast at gathering the balloons, while Spider-Man used his webs to catch the papers floating in the air. "You\'re doing fantastic, {childName}!" Spider-Man encouraged. "Your quick thinking and helpful attitude are exactly what this school needs!" As they worked together, other children joined in, and soon the whole school was helping. Everyone was laughing and having fun, turning the cleanup into a joyful game.',
        textAr: 'أطلق سبايدر مان خيوطه عالياً لإنشاء حاجز واقٍ حول فناء المدرسة. "فكرة رائعة!" هتف {childName}. "الآن لا تستطيع الرياح أن تفجر كل شيء!" معاً، بدأوا في جمع كل الزينة المتناثرة. كان {childName} سريعاً بشكل مدهش في جمع البالونات، بينما استخدم سبايدر مان خيوطه لالتقاط الأوراق العائمة في الهواء. "أنت تقوم بعمل رائع، {childName}!" شجع سبايدر مان. "تفكيرك السريع وموقفك المساعد هما بالضبط ما تحتاجه هذه المدرسة!" وأثناء عملهم معاً، انضم أطفال آخرون، وسرعان ما كانت المدرسة بأكملها تساعد. كان الجميع يضحك ويستمتع، محولين التنظيف إلى لعبة مبهجة.',
     image: '/stories/adventure1.svg',
        childImagePlacement: 'main',
        animation: 'bounce',
        soundEffect: 'pop'
      },
      {
        page: 3,
        text: 'The school fair was saved, and it was even better than before! {childName} had helped organize the most wonderful celebration the school had ever seen. Spider-Man gave {childName} a special high-five. "You know what, {childName}? You\'re the real hero here. You showed everyone that when we work together and help each other, we can overcome any challenge." The principal announced that {childName} would be the honorary helper for the day. As the sun set and Spider-Man prepared to swing away, he whispered to {childName}, "Remember, being a hero isn\'t about having superpowers. It\'s about having a super heart that cares about others. And you, {childName}, have the biggest super heart of all!" {childName} smiled widely, feeling proud and happy, knowing they had made a real difference.',
        textAr: 'تم إنقاذ معرض المدرسة، وكان أفضل من ذي قبل! ساعد {childName} في تنظيم أروع احتفال شهدته المدرسة على الإطلاق. أعطى سبايدر مان {childName} تصفيقة خاصة. "أتعلم ماذا، {childName}؟ أنت البطل الحقيقي هنا. أظهرت للجميع أنه عندما نعمل معاً ونساعد بعضنا البعض، يمكننا التغلب على أي تحد." أعلن المدير أن {childName} سيكون المساعد الفخري لهذا اليوم. مع غروب الشمس واستعداد سبايدر مان للتأرجح بعيداً، همس لـ{childName}: "تذكر، كونك بطلاً ليس بامتلاك قوى خارقة. إنه بامتلاك قلب خارق يهتم بالآخرين. وأنت، {childName}، لديك أكبر قلب خارق على الإطلاق!" ابتسم {childName} بعرض، يشعر بالفخر والسعادة، يعلم أنه أحدث فرقاً حقيقياً.',
        image: '/stories/adventure.svg',
        childImagePlacement: 'hero',
        animation: 'celebration',
        soundEffect: 'celebration'
      }
    ]
  },
  {
    id: 'sinbad_treasure_hunt',
    title: 'Sinbad and {childName}: The Magical Treasure Hunt',
    titleAr: 'سندباد و{childName}: رحلة البحث عن الكنز السحري',
    characterId: 'sinbad',
    category: 'adventure',
    ageGroup: '6-8',
    duration: 10,
    isPremium: false,
    moral: 'True treasure is friendship and helping others',
    moralAr: 'الكنز الحقيقي هو الصداقة ومساعدة الآخرين',
    keywords: ['adventure', 'treasure', 'friendship', 'ocean', 'courage'],
    keywordsAr: ['مغامرة', 'كنز', 'صداقة', 'محيط', 'شجاعة'],
    content: [
      {
        page: 1,
        text: 'On a bright sunny day by the harbor, young {childName} was building sandcastles when they heard exciting tales from the sailors. Suddenly, the legendary Sinbad the Sailor appeared, his ship\'s sails billowing in the wind. "Ahoy there, young {childName}!" Sinbad called out with a warm smile. "I\'ve heard stories of your bravery and kind heart. I\'m about to embark on a quest to find the legendary Golden Compass, which is said to help lost travelers find their way home. This magical compass is hidden on the mysterious Island of Wonders, but the journey is dangerous and I could use a brave companion like you. Would you join me on this grand adventure?" {childName}\'s eyes sparkled with excitement as they nodded eagerly, ready for the adventure of a lifetime.',
        textAr: 'في يوم مشمس ساطع بالقرب من الميناء، كان {childName} الصغير يبني قلاع الرمل عندما سمع حكايات مثيرة من البحارة. فجأة، ظهر سندباد البحار الأسطوري، وأشرعة سفينته تتماوج في الريح. "أهلاً وسهلاً، {childName} الصغير!" نادى سندباد بابتسامة دافئة. "سمعت قصصاً عن شجاعتك وقلبك الطيب. أنا على وشك الانطلاق في رحلة للعثور على البوصلة الذهبية الأسطورية، التي يُقال أنها تساعد المسافرين الضائعين في العثور على طريقهم إلى المنزل. هذه البوصلة السحرية مخبأة في جزيرة العجائب الغامضة، لكن الرحلة خطيرة ويمكنني استخدام رفيق شجاع مثلك. هل تنضم إلي في هذه المغامرة العظيمة؟" تألقت عيون {childName} بالحماس وأومأ بشغف، مستعد لمغامرة العمر.',
        image: '/stories/animal.svg',
        childImagePlacement: 'side',
        animation: 'slideIn',
        soundEffect: 'whoosh'
      },
      {
        page: 2,
        text: 'As they sailed across the deep blue ocean, {childName} proved to be an excellent navigator, spotting dolphins and seabirds that guided their way. "You have sharp eyes, {childName}!" Sinbad praised. "A true sailor notices everything the sea has to offer." Suddenly, dark clouds gathered overhead, and the wind began to howl. A terrible storm was approaching! "Don\'t worry, {childName}," Sinbad said calmly. "Storms are just nature\'s way of testing our courage. Can you help me secure the ropes while I steer the ship?" Working together, they battled the raging storm. {childName} showed incredible bravery, never giving up even when the waves grew as tall as mountains. After hours of struggle, they finally sailed into calm waters, with {childName} having proven to be a true hero of the seas.',
        textAr: 'وأثناء إبحارهم عبر المحيط الأزرق العميق، أثبت {childName} أنه ملاح ممتاز، رصد الدلافين والطيور البحرية التي أرشدتهم في طريقهم. "لديك عيون حادة، {childName}!" أثنى سندباد. "البحار الحقيقي يلاحظ كل ما يقدمه البحر." فجأة، تجمعت غيوم داكنة في السماء، وبدأت الريح تعوي. كانت عاصفة رهيبة تقترب! "لا تقلق، {childName}،" قال سندباد بهدوء. "العواصف هي مجرد طريقة الطبيعة لاختبار شجاعتنا. هل يمكنك مساعدتي في تأمين الحبال بينما أقود السفينة؟" بالعمل معاً، حاربوا العاصفة الهائجة. أظهر {childName} شجاعة لا تصدق، لم يستسلم أبداً حتى عندما نمت الأمواج بحجم الجبال. بعد ساعات من الصراع، أبحروا أخيراً في مياه هادئة، مع {childName} الذي أثبت أنه بطل حقيقي للبحار.',
        image: '/stories/adventure.svg',
        childImagePlacement: 'main',
        animation: 'bounce',
        soundEffect: 'whoosh'
      },
      {
        page: 3,
        text: 'At last, they reached the Island of Wonders, a magical place where flowers sang melodies and trees bore fruits of every color imaginable. "This is incredible!" {childName} gasped in amazement. But as they explored the island, they discovered that its magical guardian, a wise old turtle named Shello, was very sad. "My island is losing its magic," Shello explained, "because the Golden Compass has been stolen by a greedy pirate. Without it, lost travelers can\'t find their way home, and my island grows weaker each day." {childName}\'s heart filled with determination. "We have to help, Sinbad!" they declared. "That\'s exactly what I was hoping you\'d say," Sinbad replied with a proud smile. "Your compassion makes you a true treasure hunter - not for gold, but for the chance to help others."',
        textAr: 'أخيراً، وصلوا إلى جزيرة العجائب، مكان سحري حيث تغني الأزهار الألحان وتحمل الأشجار ثماراً من كل لون يمكن تخيله. "هذا لا يصدق!" لهث {childName} في دهشة. لكن أثناء استكشافهم للجزيرة، اكتشفوا أن حارسها السحري، سلحفاة عجوز حكيمة تسمى شيلو، كانت حزينة جداً. "جزيرتي تفقد سحرها،" أوضح شيلو، "لأن البوصلة الذهبية سُرقت من قبل قرصان طماع. بدونها، لا يستطيع المسافرون الضائعون العثور على طريقهم إلى المنزل، وجزيرتي تضعف كل يوم." امتلأ قلب {childName} بالعزيمة. "يجب أن نساعد، سندباد!" أعلن. "هذا بالضبط ما كنت أتمنى أن تقوله،" رد سندباد بابتسامة فخورة. "شفقتك تجعلك صياد كنوز حقيقي - ليس للذهب، بل لفرصة مساعدة الآخرين."',
        image: '/stories/adventure.svg',
        childImagePlacement: 'hero',
        animation: 'zoom',
        soundEffect: 'chime'
      },
      {
        page: 4,
        text: 'Following Shello\'s directions, Sinbad and {childName} found the pirate\'s hidden cave. Inside, they discovered not just the Golden Compass, but also the pirate himself - a lonely man named Captain Gruff who had stolen the compass because he was lost and couldn\'t find his way home to his family. "Please don\'t take it away!" Captain Gruff pleaded. "I\'ve been lost at sea for so long, and this compass is my only hope of seeing my children again." {childName}\'s kind heart immediately understood. "We don\'t want to take your hope away," {childName} said gently. "But this compass belongs to everyone who needs help finding their way. What if we all work together?" With wisdom beyond their years, {childName} suggested they use the compass to help Captain Gruff find his way home first, then return it to the island where it could help all lost travelers.',
        textAr: 'باتباع توجيهات شيلو، وجد سندباد و{childName} كهف القرصان المخفي. في الداخل، اكتشفوا ليس فقط البوصلة الذهبية، بل أيضاً القرصان نفسه - رجل وحيد يسمى الكابتن جراف الذي سرق البوصلة لأنه كان ضائعاً ولا يستطيع العثور على طريقه إلى المنزل لعائلته. "من فضلكم لا تأخذوها!" توسل الكابتن جراف. "لقد كنت ضائعاً في البحر لفترة طويلة، وهذه البوصلة هي أملي الوحيد في رؤية أطفالي مرة أخرى." فهم قلب {childName} الطيب على الفور. "لا نريد أن نأخذ أملك بعيداً،" قال {childName} بلطف. "لكن هذه البوصلة تخص كل من يحتاج مساعدة في العثور على طريقه. ماذا لو عملنا جميعاً معاً؟" بحكمة تفوق سنه، اقترح {childName} استخدام البوصلة لمساعدة الكابتن جراف في العثور على طريقه إلى المنزل أولاً، ثم إعادتها إلى الجزيرة حيث يمكنها مساعدة جميع المسافرين الضائعين.',
     image: '/stories/fairy1.svg',
        childImagePlacement: 'side',
        animation: 'fadeIn',
        soundEffect: 'ding'
      },
      {
        page: 5,
        text: 'The plan worked perfectly! Using the Golden Compass, they helped Captain Gruff navigate safely back to his family, who welcomed him with tears of joy. "Thank you, {childName}!" Captain Gruff said, hugging the brave child. "Your kindness showed me that the real treasure isn\'t gold or magic compasses - it\'s the love we share and the help we give to others." They then returned the compass to the Island of Wonders, where Shello gratefully restored its magic. The island bloomed more beautifully than ever before. As they sailed home, Sinbad placed a gentle hand on {childName}\'s shoulder. "You\'ve learned the greatest secret of all true adventurers, {childName}. The most precious treasures aren\'t things we can hold in our hands - they\'re the friendships we make and the kindness we show. You are the greatest treasure I\'ve ever found on any of my voyages." {childName} smiled, understanding that they had indeed found something more valuable than any golden compass.',
        textAr: 'نجحت الخطة بشكل مثالي! باستخدام البوصلة الذهبية، ساعدوا الكابتن جراف في الإبحار بأمان عائداً إلى عائلته، التي رحبت به بدموع الفرح. "شكراً لك، {childName}!" قال الكابتن جراف، معانقاً الطفل الشجاع. "لطفك أظهر لي أن الكنز الحقيقي ليس الذهب أو البوصلات السحرية - إنه الحب الذي نتشاركه والمساعدة التي نقدمها للآخرين." ثم أعادوا البوصلة إلى جزيرة العجائب، حيث أعاد شيلو سحرها بامتنان. ازدهرت الجزيرة بشكل أجمل من أي وقت مضى. وأثناء إبحارهم عائدين إلى المنزل، وضع سندباد يداً لطيفة على كتف {childName}. "لقد تعلمت أعظم سر لجميع المغامرين الحقيقيين، {childName}. أثمن الكنوز ليست أشياء يمكننا حملها في أيدينا - إنها الصداقات التي نكونها واللطف الذي نظهره. أنت أعظم كنز وجدته على الإطلاق في أي من رحلاتي." ابتسم {childName}، فهم أنه وجد بالفعل شيئاً أكثر قيمة من أي بوصلة ذهبية.',
     image: '/stories/superhero1.svg',
        childImagePlacement: 'hero',
        animation: 'celebration',
        soundEffect: 'celebration'
      }
    ]
  }
];

// قوالب القصص المدفوعة مع صور مناسبة
export const PREMIUM_STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'batman_mystery_solve',
    title: 'Batman and {childName}: The Gotham Mystery',
    titleAr: 'باتمان و{childName}: لغز جوثام',
    characterId: 'batman',
    category: 'superhero',
    ageGroup: '9-12',
    duration: 12,
    isPremium: true,
    moral: 'Intelligence and observation skills are powerful tools',
    moralAr: 'الذكاء ومهارات الملاحظة أدوات قوية',
    keywords: ['detective', 'mystery', 'problem-solving', 'intelligence'],
    keywordsAr: ['محقق', 'لغز', 'حل المشاكل', 'الذكاء'],
    content: [
      {
        page: 1,
        text: 'In the dark streets of Gotham City, young detective {childName} was studying at the library when the lights suddenly went out across the entire city. Through the window, they could see the Bat-Signal shining brightly in the cloudy night sky. Moments later, Batman appeared at the library window, his cape flowing dramatically in the wind. "Greetings, {childName}," Batman said in his deep, reassuring voice. "I\'ve heard about your exceptional observation skills and sharp mind. Gotham City is facing a crisis - someone has been stealing all the backup generators from hospitals and schools, leaving innocent people in darkness. I need a brilliant young detective like you to help me solve this mystery before it\'s too late. Are you ready to join me in protecting the people of Gotham?" {childName} felt a surge of excitement and responsibility, knowing that the city was counting on them.',
        textAr: 'في شوارع جوثام المظلمة، كان المحقق الصغير {childName} يدرس في المكتبة عندما انطفأت الأنوار فجأة في المدينة بأكملها. من خلال النافذة، يمكنهم رؤية إشارة الخفاش تسطع بقوة في السماء الليلية الغائمة. بعد لحظات، ظهر باتمان عند نافذة المكتبة، عباءته تتدفق بشكل دراماتيكي في الريح. "تحياتي، {childName}،" قال باتمان بصوته العميق المطمئن. "سمعت عن مهارات الملاحظة الاستثنائية لديك وعقلك الحاد. مدينة جوثام تواجه أزمة - شخص ما يسرق جميع المولدات الاحتياطية من المستشفيات والمدارس، تاركاً الأبرياء في الظلام. أحتاج محققاً شاباً لامعاً مثلك لمساعدتي في حل هذا اللغز قبل فوات الأوان. هل أنت مستعد للانضمام إلي في حماية شعب جوثام؟" شعر {childName} بموجة من الحماس والمسؤولية، يعلم أن المدينة تعتمد عليه.',
        image: '/stories/superhero1.svg',
        childImagePlacement: 'side',
        animation: 'slideIn',
        soundEffect: 'whoosh'
      },  
      {
        page: 2,
        text: 'Batman and {childName} began their investigation by examining the crime scenes. At each location, {childName} noticed something that Batman had missed - small purple footprints leading away from each building. "Excellent detective work, {childName}!" Batman praised. "These aren\'t ordinary footprints - they glow under my special UV light, which means our thief is using some kind of chemical compound." As they followed the trail, {childName} spotted a pattern. "Batman, look! All these footprints lead toward the old abandoned chemical factory on the outskirts of the city!" Batman nodded approvingly. "Your analytical thinking is impressive, {childName}. You\'re thinking like a true detective. But we must be careful - whoever is doing this is clearly very clever and potentially dangerous."',
        textAr: 'بدأ باتمان و{childName} تحقيقهما بفحص مسارح الجريمة. في كل موقع، لاحظ {childName} شيئاً فاته باتمان - آثار أقدام بنفسجية صغيرة تبتعد عن كل مبنى. "عمل تحقيقي ممتاز، {childName}!" أثنى باتمان. "هذه ليست آثار أقدام عادية - إنها تتوهج تحت ضوء الأشعة فوق البنفسجية الخاص بي، مما يعني أن اللص يستخدم نوعاً من المركبات الكيميائية." وأثناء تتبعهم للأثر، رصد {childName} نمطاً. "باتمان، انظر! كل آثار الأقدام هذه تؤدي نحو المصنع الكيميائي المهجور القديم في أطراف المدينة!" أومأ باتمان بإعجاب. "تفكيرك التحليلي مثير للإعجاب، {childName}. أنت تفكر كمحقق حقيقي. لكن يجب أن نكون حذرين - من يفعل هذا ذكي جداً وخطير محتملاً."',
        image: '/stories/adventure1.svg',
        childImagePlacement: 'main',
        animation: 'zoom',
        soundEffect: 'pop'
      },
      {
        page: 3,
        text: 'At the chemical factory, {childName} and Batman discovered that the mysterious thief was actually Dr. Victor Freeze, who was stealing the generators to power a machine that could save his sick wife. "Please don\'t stop me!" Dr. Freeze pleaded. "My wife is dying, and this machine is the only thing that can keep her alive until I find a cure!" {childName}\'s heart filled with compassion. "Batman, he\'s not really a bad person - he\'s just desperate to save someone he loves." Batman looked at {childName} with pride. "You\'ve learned the most important lesson of being a detective, {childName}. Sometimes the truth is more complicated than it appears, and the real solution isn\'t always punishment - it\'s understanding and helping." Together, they worked out a plan to help Dr. Freeze legally obtain the power he needed while also restoring electricity to the city.',
        textAr: 'في المصنع الكيميائي، اكتشف {childName} وباتمان أن اللص الغامض كان في الواقع الدكتور فيكتور فريز، الذي كان يسرق المولدات لتشغيل آلة يمكنها إنقاذ زوجته المريضة. "من فضلكم لا توقفوني!" توسل الدكتور فريز. "زوجتي تحتضر، وهذه الآلة هي الشيء الوحيد الذي يمكنه إبقاءها على قيد الحياة حتى أجد علاجاً!" امتلأ قلب {childName} بالشفقة. "باتمان، إنه ليس شخصاً سيئاً حقاً - إنه مجرد يائس لإنقاذ شخص يحبه." نظر باتمان إلى {childName} بفخر. "لقد تعلمت أهم درس في كونك محققاً، {childName}. أحياناً الحقيقة أكثر تعقيداً مما تبدو، والحل الحقيقي ليس دائماً العقاب - إنه الفهم والمساعدة." معاً، وضعوا خطة لمساعدة الدكتور فريز في الحصول قانونياً على الطاقة التي يحتاجها مع إعادة الكهرباء للمدينة أيضاً.',
        image: '/stories/adventure1.svg',
        childImagePlacement: 'hero',
        animation: 'bounce',
        soundEffect: 'chime'
      },
      {
        page: 4,
        text: 'Thanks to {childName}\'s compassionate thinking and brilliant detective work, they were able to convince Wayne Enterprises to donate a special generator to Dr. Freeze\'s laboratory, while also helping him connect with the city\'s best medical researchers. The stolen generators were returned to the hospitals and schools, and the lights of Gotham shone brightly once again. That night, as Batman and {childName} watched over the city from a rooftop, Batman placed a hand on the young detective\'s shoulder. "You\'ve shown me something important tonight, {childName}. Being a hero isn\'t just about catching the bad guys - it\'s about understanding people, showing compassion, and finding solutions that help everyone. You have the heart of a true detective and the soul of a real hero." {childName} smiled, knowing that they had not only solved a mystery but had also helped save a life and brought hope to a desperate man.',
        textAr: 'بفضل تفكير {childName} الرحيم وعمله التحقيقي اللامع، تمكنوا من إقناع شركة واين بالتبرع بمولد خاص لمختبر الدكتور فريز، مع مساعدته أيضاً في التواصل مع أفضل الباحثين الطبيين في المدينة. أُعيدت المولدات المسروقة للمستشفيات والمدارس، وأضاءت أنوار جوثام بقوة مرة أخرى. في تلك الليلة، بينما راقب باتمان و{childName} المدينة من على سطح، وضع باتمان يده على كتف المحقق الصغير. "لقد أظهرت لي شيئاً مهماً الليلة، {childName}. كونك بطلاً لا يتعلق فقط بالقبض على الأشرار - إنه يتعلق بفهم الناس، وإظهار الشفقة، وإيجاد حلول تساعد الجميع. لديك قلب محقق حقيقي وروح بطل حقيقي." ابتسم {childName}، يعلم أنه لم يحل لغزاً فحسب، بل ساعد أيضاً في إنقاذ حياة وجلب الأمل لرجل يائس.',
        image: '/stories/fairy1.svg',
        childImagePlacement: 'hero',
        animation: 'celebration',
        soundEffect: 'celebration'
      }
    ]
  },
  // يمكن إضافة المزيد من القصص المدفوعة هنا مع صور مناسبة
  {
    id: 'wonder_woman_island_adventure',
    title: 'Wonder Woman and {childName}: The Paradise Island Adventure',
    titleAr: 'المرأة المعجزة و{childName}: مغامرة جزيرة الفردوس',
    characterId: 'wonder_woman',
    category: 'superhero',
    ageGroup: '6-8',
    duration: 10,
    isPremium: true,
    moral: 'Courage and wisdom together can overcome any challenge',
    moralAr: 'الشجاعة والحكمة معاً يمكنهما التغلب على أي تحد',
    keywords: ['courage', 'wisdom', 'strength', 'leadership'],
    keywordsAr: ['الشجاعة', 'الحكمة', 'القوة', 'القيادة'],
    content: [
      {
        page: 1,
        text: 'On the mystical Paradise Island, young warrior {childName} was training with the Amazons when a terrible storm began to threaten the island. Wonder Woman approached {childName} with her golden lasso glowing in the sunlight. "Brave {childName}," she said with admiration, "I\'ve watched your training, and you have the heart of a true Amazon warrior. Our island\'s magical barrier is weakening, and we need to restore the ancient Crystal of Harmony before the storm destroys everything we hold dear. This quest requires not just strength, but wisdom and courage. Will you join me on this sacred mission?" {childName} stood tall, feeling honored to be chosen by the legendary Wonder Woman, and nodded with determination, ready to prove their worth as a guardian of Paradise Island.',
        textAr: 'في جزيرة الفردوس الغامضة، كان المحارب الصغير {childName} يتدرب مع الأمازونيات عندما بدأت عاصفة رهيبة تهدد الجزيرة. اقتربت المرأة المعجزة من {childName} ولاسوها الذهبي يتوهج في ضوء الشمس. "أيها الشجاع {childName}،" قالت بإعجاب، "لقد راقبت تدريبك، ولديك قلب محارب أمازوني حقيقي. الحاجز السحري لجزيرتنا يضعف، ونحتاج لاستعادة بلورة الانسجام القديمة قبل أن تدمر العاصفة كل ما نحبه. هذه المهمة تتطلب ليس فقط القوة، بل الحكمة والشجاعة أيضاً. هل تنضم إلي في هذه المهمة المقدسة؟" وقف {childName} منتصباً، يشعر بالشرف لكونه مختاراً من قبل المرأة المعجزة الأسطورية، وأومأ بعزم، مستعد لإثبات جدارته كحارس لجزيرة الفردوس.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center&q=80',
        childImagePlacement: 'side',
        animation: 'slideIn',
        soundEffect: 'whoosh'
      },
      {
        page: 2,
        text: 'Together, Wonder Woman and {childName} ventured into the ancient Temple of Athena, where the Crystal of Harmony was once kept. The temple was filled with challenging puzzles that tested both mind and spirit. "Look closely, {childName}," Wonder Woman advised. "Each puzzle teaches us a lesson about wisdom and courage." {childName} carefully studied the ancient symbols on the walls and discovered a pattern that revealed the location of the crystal. "Brilliant observation!" Wonder Woman praised. "You\'ve learned that true strength comes from understanding, not just physical power." As they solved each puzzle together, {childName} began to understand the deeper wisdom of the Amazons - that the greatest victories come from using both heart and mind in harmony.',
        textAr: 'معاً، غامرت المرأة المعجزة و{childName} في معبد أثينا القديم، حيث كانت بلورة الانسجام محفوظة ذات مرة. كان المعبد مليئاً بالألغاز الصعبة التي تختبر العقل والروح معاً. "انظر بعناية، {childName}،" نصحت المرأة المعجزة. "كل لغز يعلمنا درساً عن الحكمة والشجاعة." درس {childName} بعناية الرموز القديمة على الجدران واكتشف نمطاً كشف عن موقع البلورة. "ملاحظة رائعة!" أثنت المرأة المعجزة. "لقد تعلمت أن القوة الحقيقية تأتي من الفهم، وليس فقط من القوة الجسدية." وأثناء حلهم لكل لغز معاً، بدأ {childName} في فهم الحكمة الأعمق للأمازونيات - أن أعظم الانتصارات تأتي من استخدام القلب والعقل معاً في انسجام.',
        image: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=800&h=400&fit=crop&crop=center&q=80',
        childImagePlacement: 'main',
        animation: 'zoom',
        soundEffect: 'chime'
      },
      {
        page: 3,
        text: 'When they finally reached the inner sanctum, they discovered that the Crystal of Harmony had been shattered into three pieces by the dark magic of the storm. "We must gather all three pieces before the temple collapses," Wonder Woman explained urgently. {childName} bravely volunteered to retrieve the piece that was guarded by a fierce stone griffin. Using the wisdom they had learned from the puzzles, {childName} approached the griffin not with force, but with respect and understanding. "Great guardian," {childName} spoke gently, "we seek the crystal not for power, but to protect all the innocent lives on the island." The griffin, moved by {childName}\'s pure heart and wise words, stepped aside and allowed them to take the crystal piece. Wonder Woman watched with pride as {childName} demonstrated that true courage means standing up for others, even in the face of danger.',
        textAr: 'عندما وصلوا أخيراً إلى القدس الأقداس، اكتشفوا أن بلورة الانسجام تحطمت إلى ثلاث قطع بفعل السحر المظلم للعاصفة. "يجب أن نجمع القطع الثلاث قبل أن ينهار المعبد،" أوضحت المرأة المعجزة بإلحاح. تطوع {childName} بشجاعة لاستعادة القطعة التي كان يحرسها غريفين حجري شرس. باستخدام الحكمة التي تعلمها من الألغاز، اقترب {childName} من الغريفين ليس بالقوة، بل بالاحترام والفهم. "أيها الحارس العظيم،" تحدث {childName} بلطف، "نحن نسعى للبلورة ليس للقوة، بل لحماية جميع الأرواح البريئة في الجزيرة." الغريفين، متأثراً بقلب {childName} الطاهر وكلماته الحكيمة، تنحى جانباً وسمح لهم بأخذ قطعة البلورة. راقبت المرأة المعجزة بفخر بينما أظهر {childName} أن الشجاعة الحقيقية تعني الدفاع عن الآخرين، حتى في وجه الخطر.',
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=400&fit=crop&crop=center&q=80',
        childImagePlacement: 'hero',
        animation: 'bounce',
        soundEffect: 'ding'
      },
      {
        page: 4,
        text: 'With all three crystal pieces united, Wonder Woman and {childName} worked together to restore the Crystal of Harmony. As the crystal began to glow with magical light, the storm clouds parted and the island\'s protective barrier was renewed stronger than ever before. The other Amazons cheered as peace returned to Paradise Island. Queen Hippolyta herself came to thank {childName} personally. "Young warrior," the Queen said with deep respect, "you have shown that wisdom and courage are the greatest powers of all. You will always be welcome among the Amazons as an honorary guardian of justice." Wonder Woman placed her golden tiara briefly on {childName}\'s head. "Remember, {childName}, you don\'t need magical powers to be a hero. Your brave heart, wise mind, and compassionate spirit are the greatest gifts anyone can possess. You\'ve proven today that a true warrior fights not for glory, but to protect those who cannot protect themselves." As the sun set over Paradise Island, {childName} knew they had found their calling as a defender of the innocent.',
        textAr: 'مع توحيد قطع البلورة الثلاث، عملت المرأة المعجزة و{childName} معاً لاستعادة بلورة الانسجام. وأثناء بدء البلورة في التوهج بالضوء السحري، انفرقت غيوم العاصفة وتجدد الحاجز الواقي للجزيرة أقوى من أي وقت مضى. هتفت الأمازونيات الأخريات مع عودة السلام إلى جزيرة الفردوس. جاءت الملكة هيبوليتا بنفسها لشكر {childName} شخصياً. "أيها المحارب الصغير،" قالت الملكة باحترام عميق، "لقد أظهرت أن الحكمة والشجاعة هما أعظم القوى على الإطلاق. ستكون دائماً مرحباً بك بين الأمازونيات كحارس فخري للعدالة." وضعت المرأة المعجزة تاجها الذهبي لفترة وجيزة على رأس {childName}. "تذكر، {childName}، لا تحتاج لقوى سحرية لتكون بطلاً. قلبك الشجاع وعقلك الحكيم وروحك الرحيمة هي أعظم الهدايا التي يمكن لأي شخص امتلاكها. لقد أثبت اليوم أن المحارب الحقيقي لا يقاتل من أجل المجد، بل لحماية من لا يستطيعون حماية أنفسهم." مع غروب الشمس فوق جزيرة الفردوس، علم {childName} أنه وجد دعوته كمدافع عن الأبرياء.',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&crop=center&q=80',
        childImagePlacement: 'hero',
        animation: 'celebration',
        soundEffect: 'celebration'
      }
    ]
  }
];

// باقي الدوال تبقى كما هي...
export function getAllStories(): StoryTemplate[] {
  return [...FREE_STORY_TEMPLATES, ...PREMIUM_STORY_TEMPLATES];
}

export function getAvailableStories(isPremium: boolean): StoryTemplate[] {
  if (isPremium) {
    return getAllStories();
  }
  return FREE_STORY_TEMPLATES;
}

export function searchStories(query: string, isPremium: boolean): StoryTemplate[] {
  const availableStories = getAvailableStories(isPremium);
  const lowercaseQuery = query.toLowerCase();
  
  return availableStories.filter(story => 
    story.title.toLowerCase().includes(lowercaseQuery) ||
    story.titleAr.includes(query) ||
    story.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
    story.keywordsAr.some(keyword => keyword.includes(query)) ||
    story.moral.toLowerCase().includes(lowercaseQuery) ||
    story.moralAr.includes(query)
  );
}

export function getStoriesByCategory(category: string, isPremium: boolean): StoryTemplate[] {
  const availableStories = getAvailableStories(isPremium);
  return availableStories.filter(story => story.category === category);
}

export function getStoriesByAgeGroup(ageGroup: string, isPremium: boolean): StoryTemplate[] {
  const availableStories = getAvailableStories(isPremium);
  return availableStories.filter(story => story.ageGroup === ageGroup);
}

export function personalizeStory(story: StoryTemplate, childName: string): StoryTemplate {
  const safeName = childName && childName.trim() ? childName.trim() : 'البطل الصغير';
  
  const personalizedStory: StoryTemplate = {
    ...story,
    title: story.title.replace(/{childName}/g, safeName),
    titleAr: story.titleAr.replace(/{childName}/g, safeName),
    content: story.content.map(page => ({
      ...page,
      text: page.text.replace(/{childName}/g, safeName),
      textAr: page.textAr.replace(/{childName}/g, safeName)
    })),
    moral: story.moral.replace(/{childName}/g, safeName),
    moralAr: story.moralAr.replace(/{childName}/g, safeName),
    id: `${story.id}_personalized_${safeName.replace(/\s+/g, '_').toLowerCase()}`
  };
  
  return personalizedStory;
}

export function getCharacterById(characterId: string): StoryCharacter | undefined {
  return STORY_CHARACTERS.find(character => character.id === characterId);
}

export function getRandomStory(isPremium: boolean): StoryTemplate {
  const availableStories = getAvailableStories(isPremium);
  const randomIndex = Math.floor(Math.random() * availableStories.length);
  return availableStories[randomIndex];
}

export function getPopularStories(isPremium: boolean, limit: number = 3): StoryTemplate[] {
  const availableStories = getAvailableStories(isPremium);
  return availableStories
    .sort((a, b) => (b.content.length + b.duration) - (a.content.length + a.duration))
    .slice(0, limit);
}

export function getRecommendedStories(ageGroup: string, isPremium: boolean, limit: number = 5): StoryTemplate[] {
  const storiesForAge = getStoriesByAgeGroup(ageGroup, isPremium);
  return storiesForAge.slice(0, limit);
}