
import type { GrammarLesson } from "@/lib/types";

export const grammarLessons: GrammarLesson[] = [
  // ==================== N5 Lessons ====================
  {
    title: "Basic Sentence Structure (SOV)",
    level: "N5",
    explanation: "Japanese sentence structure is typically Subject-Object-Verb (SOV). This is different from English's Subject-Verb-Object (SVO) structure. The particle 'は' (wa) often marks the topic of the sentence, and 'を' (o) marks the direct object.",
    exampleSentences: [
      {
        japanese: "私は寿司を食べます。",
        reading: "わたしはすしをたべます。",
        meaning: "I eat sushi."
      },
      {
        japanese: "猫は魚が好きです。",
        reading: "ねこはさかながすきです。",
        meaning: "The cat likes fish."
      }
    ]
  },
  {
    title: "Particles は (wa) and が (ga)",
    level: "N5",
    explanation: "は (wa) is the topic marker, introducing what the sentence is about. が (ga) is the subject marker, identifying who or what is performing an action or being described. Use が for new information or to emphasize the subject.",
    exampleSentences: [
      {
        japanese: "今日はいい天気です。",
        reading: "きょうはいいてんきです。",
        meaning: "Today, the weather is good. (Topic: Today)"
      },
      {
        japanese: "雨が降っています。",
        reading: "あめがふっています。",
        meaning: "It is raining. (Subject: Rain, new information)"
      }
    ]
  },
  {
    title: "Verb Conjugation (Masu-form)",
    level: "N5",
    explanation: "The -masu form is a polite way to end a verb in the present or future tense. To make it past tense, change -masu to -mashita. To make it negative, change -masu to -masen. For past negative, change it to -masen deshita.",
    exampleSentences: [
      {
        japanese: "毎日、勉強します。",
        reading: "まいにち、べんきょうします。",
        meaning: "I study every day. (Present)"
      },
      {
        japanese: "昨日、映画を見ました。",
        reading: "きのう、えいがをみました。",
        meaning: "I watched a movie yesterday. (Past)"
      },
      {
        japanese: "お酒は飲みません。",
        reading: "おさけはのみません。",
        meaning: "I don't drink alcohol. (Negative)"
      }
    ]
  },
  {
    title: "Particle の (no) for Possession",
    level: "N5",
    explanation: "The particle の (no) is used to show possession, similar to 's in English. It connects two nouns, where the first noun possesses or describes the second noun.",
    exampleSentences: [
      {
        japanese: "これは私の本です。",
        reading: "これはわたしのほんです。",
        meaning: "This is my book."
      },
      {
        japanese: "あれは山田さんの車です。",
        reading: "あれはまださんのくるまです。",
        meaning: "That is Mr. Yamada's car."
      }
    ]
  },
  {
    title: "i-Adjectives and na-Adjectives",
    level: "N5",
    explanation: "Japanese has two types of adjectives. 'i-adjectives' always end in い (i) (e.g., 大きい - ookii, 'big'). 'na-adjectives' do not end in い, and require な (na) when placed before a noun (e.g., きれいな花 - kirei na hana, 'beautiful flower').",
    exampleSentences: [
      {
        japanese: "このカバンは大きいです。",
        reading: "このかばんはおおきいです。",
        meaning: "This bag is big. (i-adjective)"
      },
      {
        japanese: "静かな図書館",
        reading: "しずかなとしょかん",
        meaning: "A quiet library. (na-adjective before noun)"
      },
      {
        japanese: "この町は静かです。",
        reading: "このまちはしずかです。",
        meaning: "This town is quiet. (na-adjective at end of sentence)"
      }
    ]
  },
   {
    title: "Particles に, へ, and で",
    level: "N5",
    explanation: "に (ni) marks a specific time, destination of movement, or location of existence. へ (e) marks the general direction of movement. で (de) marks the location where an action takes place.",
    exampleSentences: [
      {
        japanese: "私は家にいます。",
        reading: "わたしはいえにいます。",
        meaning: "I am at home. (Location of existence)"
      },
      {
        japanese: "東京へ行きます。",
        reading: "とうきょうへいきます。",
        meaning: "I am going to Tokyo. (Direction)"
      },
      {
        japanese: "図書館で勉強します。",
        reading: "としょかんでべんきょうします。",
        meaning: "I study at the library. (Location of action)"
      }
    ]
  },
  {
    title: "The Te-form (て形)",
    level: "N5",
    explanation: "The te-form is a versatile verb conjugation that doesn't indicate tense. It's used for making requests (〜てください), connecting successive actions (action 1, and then action 2), asking for permission (〜てもいいですか), and more.",
    exampleSentences: [
      {
        japanese: "朝ごはんを食べて、学校に行きます。",
        reading: "あさごはんをたべて、がっこうにいきます。",
        meaning: "I eat breakfast and then go to school."
      },
      {
        japanese: "ちょっと待ってください。",
        reading: "ちょっとまってください。",
        meaning: "Please wait a moment."
      },
      {
        japanese: "写真を撮ってもいいですか。",
        reading: "しゃしんをとってもいいですか。",
        meaning: "May I take a picture?"
      }
    ]
  },
  {
    title: "Te-form + います (Present Progressive)",
    level: "N5",
    explanation: "The te-form of a verb followed by います (imasu) describes an action currently in progress, similar to '-ing' in English. It can also describe a continuous state.",
    exampleSentences: [
      {
        japanese: "何をしていますか？",
        reading: "なにをしていますか？",
        meaning: "What are you doing?"
      },
      {
        japanese: "音楽を聞いています。",
        reading: "おんがくをきいています。",
        meaning: "I am listening to music."
      },
      {
        japanese: "佐藤さんは結婚しています。",
        reading: "さとうさんはけっこんしています。",
        meaning: "Mr. Sato is married. (A continuous state)"
      }
    ]
  },
  {
    title: "Making Invitations (〜ませんか vs 〜ましょう)",
    level: "N5",
    explanation: "To invite someone to do something, you can use 〜ませんか (masen ka?) for a polite suggestion ('Won't you...?') or 〜ましょう (mashou) for a more direct proposal ('Let's...').",
    exampleSentences: [
      {
        japanese: "一緒に映画を見ませんか？",
        reading: "いっしょにえいがをみませんか？",
        meaning: "Won't you watch a movie with me?"
      },
      {
        japanese: "喫茶店で話しましょう。",
        reading: "きっさてんで話しましょう。",
        meaning: "Let's talk at the coffee shop."
      }
    ]
  },
   {
    title: "Expressing Desire (〜たい)",
    level: "N5",
    explanation: "To express your desire to do something, you change the 'ます' (masu) from the verb stem to 'たいです' (tai desu). It conjugates like an i-adjective.",
    exampleSentences: [
      {
        japanese: "私は寿司が食べたいです。",
        reading: "わたしはすしがたべたいです。",
        meaning: "I want to eat sushi."
      },
      {
        japanese: "日本に行きたくないです。",
        reading: "にほんにいきたくないです。",
        meaning: "I don't want to go to Japan."
      }
    ]
  },
  {
    title: "Plain Form (Dictionary Form)",
    level: "N5",
    explanation: "The plain form, or dictionary form, is the base form of a verb. It's used in casual conversation and in various grammatical structures. For example, the plain form of 食べます (tabemasu) is 食べる (taberu).",
    exampleSentences: [
      {
        japanese: "友達と話すのが好きだ。",
        reading: "ともだちとはなすのがすきだ。",
        meaning: "I like talking with my friends. (Casual speech)"
      },
      {
        japanese: "本を読む時間がない。",
        reading: "ほんをよむじかんがない。",
        meaning: "I don't have time to read books. (Grammatical structure)"
      }
    ]
  },
  {
    title: "Plain Past Tense (Ta-form)",
    level: "N5",
    explanation: "The ta-form is the plain past tense of verbs, equivalent to the polite -mashita form. It's formed by changing the 'e' in the te-form to 'a'. For example, 食べて (tabete) becomes 食べた (tabeta).",
    exampleSentences: [
      {
        japanese: "昨日、何を食べた？",
        reading: "きのう、なにをたべた？",
        meaning: "What did you eat yesterday? (Casual)"
      },
      {
        japanese: "日本に行ったことがある。",
        reading: "にほんにいったことがある。",
        meaning: "I have been to Japan. (Expressing experience)"
      }
    ]
  },
  {
    title: "Comparison (AよりBのほうが...)",
    level: "N5",
    explanation: "To compare two items, use the structure 'A yori B no hou ga...' which means 'B is more ... than A'. The adjective comes after 'hou ga'.",
    exampleSentences: [
      {
        japanese: "バスより電車の方が速いです。",
        reading: "ばすよりでんしゃのほうがはやいです。",
        meaning: "The train is faster than the bus."
      },
      {
        japanese: "犬と猫とどちらの方が好きですか？",
        reading: "いぬとねことどちらのほうがすきですか？",
        meaning: "Which do you like more, dogs or cats?"
      }
    ]
  },
  {
    title: "Giving Reasons (から)",
    level: "N5",
    explanation: "から (kara) is used to mean 'because' or 'so'. It follows the clause that states the reason.",
    exampleSentences: [
      {
        japanese: "時間がないから、急ぎましょう。",
        reading: "じかんがないから、いそぎましょう。",
        meaning: "Because there's no time, let's hurry."
      },
       {
        japanese: "明日は休みですから、今日たくさん遊びます。",
        reading: "あしたはやすみですから、きょうたくさんあそびます。",
        meaning: "Because tomorrow is a holiday, I will play a lot today."
      }
    ]
  },

  // ==================== N4 Lessons ====================
  {
    title: "Potential Form (Can do)",
    level: "N4",
    explanation: "The potential form expresses the ability to do something ('can do'). Ru-verbs change the final -ru to -rareru. U-verbs change the final 'u' sound to the 'e' sound and add -ru.",
    exampleSentences: [
      {
        japanese: "私は漢字が読めます。",
        reading: "わたしはかんじがよめます。",
        meaning: "I can read kanji. (Polite form)"
      },
      {
        japanese: "彼は日本語を話せる。",
        reading: "かれはにほんごをはなせる。",
        meaning: "He can speak Japanese. (Plain form)"
      }
    ]
  },
   {
    title: "Quoting and Thinking (〜と...)",
    level: "N4",
    explanation: "Use 〜と思います (to omoimasu) to express your opinion ('I think...'). Use 〜と言っていました (to itte imashita) to report what someone else said ('...said that...'). Both use the plain form of the verb or adjective before the quote.",
    exampleSentences: [
      {
        japanese: "明日は雨が降ると思います。",
        reading: "あしたはあめがふるとおもいます。",
        meaning: "I think it will rain tomorrow."
      },
      {
        japanese: "田中さんはパーティーに来ないと言っていました。",
        reading: "たなかさんはパーティーにこないといっていました。",
        meaning: "Ms. Tanaka said she isn't coming to the party."
      }
    ]
  },
  {
    title: "Giving Advice (〜たらどうですか / 〜方がいい)",
    level: "N4",
    explanation: "The structure (Verb, ta-form) + 方がいいです (hou ga ii desu) is used to give strong advice ('it would be better to...'). For a softer suggestion, use (Verb, ta-form) + らどうですか (ra dou desu ka?) which is like 'how about...?'.",
    exampleSentences: [
      {
        japanese: "もっと野菜を食べた方がいいですよ。",
        reading: "もっとやさいをたべたほうがいいですよ。",
        meaning: "You should eat more vegetables."
      },
      {
        japanese: "疲れたら、少し休んだらどうですか。",
        reading: "つかれたら、すこしやすんだらどうですか。",
        meaning: "If you're tired, how about taking a little rest?"
      }
    ]
  },
  {
    title: "Expressing Obligation (〜なければならない)",
    level: "N4",
    explanation: "To express that you must do something, use the negative plain form of a verb, drop the final 'i', and add -kereba narimasen. Casual forms include なきゃ (nakya) and ないと (nai to).",
    exampleSentences: [
      {
        japanese: "宿題をしなければなりません。",
        reading: "しゅくだいをしなければなりません。",
        meaning: "I must do my homework."
      },
      {
        japanese: "明日、早く起きなきゃ。",
        reading: "あした、はやくおきなきゃ。",
        meaning: "I gotta get up early tomorrow. (Casual)"
      }
    ]
  },
  {
    title: "Volitional Form (〜う / 〜よう)",
    level: "N4",
    explanation: "The volitional form expresses intention ('Let's do...' or 'I'll do...'). Ru-verbs change -ru to -you. U-verbs change the final 'u' vowel to 'o' and add 'u'. Polite form is 〜ましょう (mashou).",
    exampleSentences: [
      {
        japanese: "週末、何をしようか？",
        reading: "しゅうまつ、なにをしようか？",
        meaning: "What should we do this weekend? (Casual)"
      },
      {
        japanese: "日本に行こうと思っています。",
        reading: "にほんにいこうとおもっています。",
        meaning: "I am thinking of going to Japan."
      }
    ]
  },
   {
    title: "Giving and Receiving (あげる, くれる, もらう)",
    level: "N4",
    explanation: "あげる (ageru): I/someone gives to an outsider. くれる (kureru): Someone gives to me/my in-group. もらう (morau): I/someone receives from someone.",
    exampleSentences: [
      {
        japanese: "私は妹にプレゼントをあげました。",
        reading: "わたしはいもうとにぷれぜんとをあげました。",
        meaning: "I gave my little sister a present."
      },
      {
        japanese: "佐藤さんが私に花をくれました。",
        reading: "さとうさんがわたしにはなをくれました。",
        meaning: "Mr. Sato gave me flowers."
      },
       {
        japanese: "私は友達に本をもらいました。",
        reading: "わたしはともだちにほんをもらいました。",
        meaning: "I received a book from my friend."
      }
    ]
  },
  {
    title: "Trying Something (〜てみる)",
    level: "N4",
    explanation: "Use the te-form of a verb + みる (miru) to express the idea of trying something to see what it's like.",
    exampleSentences: [
      {
        japanese: "このケーキ、美味しいかどうか食べてみます。",
        reading: "このけーき、おいしいかどうわたべてみます。",
        meaning: "I'll try this cake to see if it's delicious."
      },
      {
        japanese: "新しいアプリを使ってみました。",
        reading: "あたらしいあぷりをつかってみました。",
        meaning: "I tried using the new app."
      }
    ]
  },
  {
    title: "Conditionals (と, ば, たら, なら)",
    level: "N4",
    explanation: "と: Natural consequence ('if/when A, then B always happens'). ば: General conditional ('if A, then B'). たら: Most common conditional, for specific situations ('if/when A happens, then B'). なら: Contextual conditional, based on what was said ('if that's the case...').",
    exampleSentences: [
      {
        japanese: "春になると、桜が咲きます。",
        reading: "はるになると、さくらがさきます。",
        meaning: "When spring comes, the cherry blossoms bloom. (と)"
      },
      {
        japanese: "時間があれば、映画を見ます。",
        reading: "じかんがあれば、えいがをみます。",
        meaning: "If I have time, I watch movies. (ば)"
      },
       {
        japanese: "日本に行ったら、寿司を食べたいです。",
        reading: "にほんにいったら、すしをたべたいです。",
        meaning: "If/When I go to Japan, I want to eat sushi. (たら)"
      },
      {
        japanese: "「日本へ行きます。」「日本へ行くなら、京都がおすすめです。」",
        reading: "「にほんへいきます。」「にほんへいくなら、きょうとがおすすめです。」",
        meaning: "'I'm going to Japan.' 'If you're going to Japan, I recommend Kyoto.' (なら)"
      }
    ]
  },
   {
    title: "Passive Form (〜られる)",
    level: "N4",
    explanation: "The passive voice is used when the subject is acted upon. Ru-verbs change -ru to -rareru. U-verbs change the final 'u' sound to 'a' and add -reru. The 'actor' is marked by に (ni).",
    exampleSentences: [
      {
        japanese: "私は先生に褒められました。",
        reading: "わたしはせんせいにほめられました。",
        meaning: "I was praised by the teacher."
      },
      {
        japanese: "弟にケーキを食べられました。",
        reading: "おとうとにけーきをたべられました。",
        meaning: "My cake was eaten by my little brother. (Suffering passive)"
      }
    ]
  }
];
