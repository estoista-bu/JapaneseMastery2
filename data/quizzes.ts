
import type { Quiz } from "@/lib/types";

export const quizzes: Quiz[] = [
  {
    id: "n5-quiz-1",
    title: "N5 Quiz 1: Basics",
    level: "N5",
    questions: [
      {
        question: "Which sentence correctly uses the SOV (Subject-Object-Verb) structure?",
        options: [
          "食べます私は寿司を",
          "私は寿司を食べます",
          "寿司を私は食べます",
          "私は食べます寿司を"
        ],
        optionsReading: [
            "たべますわたしはすしを",
            "わたしはすしをたべます",
            "すしをわたしはたべます",
            "わたしはたべますすしを"
        ],
        correctAnswer: "私は寿司を食べます",
        explanation: "Japanese sentence structure is typically Subject-Object-Verb. '私は' is the subject, '寿司を' is the object, and '食べます' is the verb.",
      },
      {
        question: "Select the correct particle for possession: 'これは私___本です'.",
        questionReading: "これはわたし___ほんです",
        options: ["は", "が", "を", "の"],
        correctAnswer: "の",
        explanation: "The particle の is used to show possession, like 's in English. '私の本' means 'my book'.",
      },
      {
        question: "Which of the following is an 'i-adjective'?",
        options: ["静か", "大きい", "きれい", "有名"],
        optionsReading: ["しずか", "おおきい", "きれい", "ゆうめい"],
        correctAnswer: "大きい",
        explanation: "i-adjectives, in their dictionary form, end with the hiragana character い. 大きい is a classic example.",
      },
       {
        question: "Which particle marks the topic of a sentence?",
        options: ["が", "を", "は", "に"],
        correctAnswer: "は",
        explanation: "は is the topic marker, used to introduce what the sentence is about.",
      },
      {
        question: "How do you say 'I watched a movie yesterday' in polite form?",
        options: [
            "昨日、映画を見ます",
            "昨日、映画を見ません",
            "昨日、映画を見ました",
            "昨日、映画を見ませんでした"
        ],
        optionsReading: [
            "きのう、えいがをみます",
            "きのう、えいがをみません",
            "きのう、えいがをみました",
            "きのう、えいがをみませんでした"
        ],
        correctAnswer: "昨日、映画を見ました",
        explanation: "The polite past tense of verbs is formed by changing the '-masu' ending to '-mashita'.",
      },
      {
        question: "Fill in the blank: '山田さん___車は新しいです.'",
        questionReading: "やまださん___くるまはあたらしいです",
        options: ["の", "は", "が", "を"],
        correctAnswer: "の",
        explanation: "The particle 'の' is used to show possession. '山田さんの車' means 'Mr. Yamada's car'.",
      },
      {
        question: "Which of the following is a 'na-adjective'?",
        options: ["高い", "静か", "寒い", "美味しい"],
        optionsReading: ["たかい", "しずか", "さむい", "おいしい"],
        correctAnswer: "静か",
        explanation: "'na-adjectives' are adjectives that require 'な' before a noun but not at the end of a sentence. '静か' (quiet) is a 'na-adjective'.",
      },
      {
        question: "Which sentence means 'That is a dictionary'?",
        options: [
          "これは辞書です",
          "それは辞書です",
          "あれは辞書です",
          "どれは辞書です"
        ],
        optionsReading: [
            "これはじしょです",
            "それはじしょです",
            "あれはじしょです",
            "どれはじしょです"
        ],
        correctAnswer: "あれは辞書です",
        explanation: "これ refers to something near the speaker, それ to something near the listener, and あれ to something far from both.",
      },
      {
        question: "What is the negative form of '高いです' (takai desu)?",
        options: ["高くないです", "高くありません", "高かったです", "A and B"],
        optionsReading: ["たかくないです", "たかくありません", "たかかったです", "AとB"],
        correctAnswer: "A and B",
        explanation: "For i-adjectives, the negative form can be either '-kunai desu' or '-ku arimasen'. Both '高くないです' and '高くありません' mean 'is not expensive'.",
      },
      {
        question: "What particle is used to mark the object of a verb?",
        options: ["を", "が", "に", "で"],
        correctAnswer: "を",
        explanation: "The particle 'を' (pronounced 'o') marks the direct object of a verb, as in 'パンを食べます' (I eat bread).",
      }
    ]
  },
  {
    id: "n5-quiz-2",
    title: "N5 Quiz 2: Particles & Verbs",
    level: "N5",
    questions: [
       {
        question: "Which particle marks the location where an action takes place?",
        options: ["が", "で", "は", "に"],
        correctAnswer: "で",
        explanation: "The particle で marks the location of an action. For example, '図書館で勉強します' (I study at the library).",
      },
      {
        question: "How do you say 'I will not eat' in polite form?",
        options: [
            "食べます",
            "食べません",
            "食べました",
            "食べませんでした"
        ],
        optionsReading: [
            "たべます",
            "たべません",
            "たべました",
            "たべませんでした"
        ],
        correctAnswer: "食べません",
        explanation: "The polite negative present/future tense is formed by changing the '-masu' ending to '-masen'.",
      },
      {
        question: "What is the te-form of the verb '待ちます'?",
        options: ["待って", "待ちて", "待んで", "まて"],
        optionsReading: ["まって", "まちて", "まんで", "まて"],
        correctAnswer: "待って",
        explanation: "For u-verbs ending in -chimasu, the te-form is created by replacing 'chimasu' with 'tte'.",
      },
      {
        question: "How do you say 'quiet library' using a na-adjective?",
        options: ["静か図書館", "静かな図書館", "静かい図書館", "静かで図書館"],
        optionsReading: ["しずかとしょかん", "しずかなとしょかん", "しずかいとしょかん", "しずかでとしょかん"],
        correctAnswer: "静かな図書館",
        explanation: "When a na-adjective comes directly before a noun, you must add な between them.",
      },
       {
        question: "How do you say 'Mr. Sato is married.' to describe a continuous state?",
        options: ["佐藤さんは結婚します", "佐藤さんは結婚しました", "佐藤さんは結婚しています", "佐藤さんは結婚しません"],
        optionsReading: ["さとうさんはけっこんします", "さとうさんはけっこんしました", "さとうさんはけっこんしています", "さとうさんはけっこんしません"],
        correctAnswer: "佐藤さんは結婚しています",
        explanation: "The 'te-form + います' structure is used not only for actions in progress but also to describe a continuous state, like being married.",
      },
      {
        question: "Choose the correct particle: '私は東京___行きます'.",
        questionReading: "わたしはとうきょう___いきます",
        options: ["を", "で", "へ", "が"],
        correctAnswer: "へ",
        explanation: "The particle 'へ' (pronounced 'e') is used to indicate the direction of movement.",
      },
      {
        question: "What does '〜ています' express?",
        options: ["A completed action", "An action in progress or a state", "A desired action", "A potential action"],
        correctAnswer: "An action in progress or a state",
        explanation: "'〜ています' (te-form + imasu) is used for both ongoing actions (e.g., 食べています - I am eating) and continuous states (e.g., 結婚しています - I am married).",
      },
      {
        question: "Which particle marks a specific point in time?",
        options: ["に", "で", "と", "から"],
        correctAnswer: "に",
        explanation: "The particle 'に' is used to mark specific times, like '７時に起きます' (I wake up at 7 o'clock).",
      },
      {
        question: "How do you form the negative past polite form of '飲みます' (nomimasu)?",
        options: ["飲みませんでした", "飲みません", "飲みました", "飲まないでした"],
        optionsReading: ["のみませんでした", "のみません", "のみました", "のまないでした"],
        correctAnswer: "飲みませんでした",
        explanation: "The past negative polite form is created by changing '-masu' to '-masen deshita'.",
      },
      {
        question: "Which particle is used to mean 'and' when listing nouns?",
        options: ["と", "も", "や", "A and C"],
        correctAnswer: "A and C",
        explanation: "'と' is used for an exhaustive list ('A and B'). 'や' is used for a non-exhaustive list ('A and B, among other things'). Both can mean 'and'.",
      }
    ]
  },
   {
    id: "n5-quiz-3",
    title: "N5 Quiz 3: More Forms",
    level: "N5",
    questions: [
      {
        question: "How do you express 'I want to drink water'?",
        options: ["水が飲めます", "水を飲みます", "水が飲みたいです", "水を飲もう"],
        optionsReading: ["みずがのめます", "みずをのみます", "みずがのみたいです", "みずをのもう"],
        correctAnswer: "水が飲みたいです",
        explanation: "To express desire, you change the 'ます' from the verb stem to 'たいです'. '飲みます' becomes '飲みたいです'.",
      },
       {
        question: "What is the plain form (dictionary form) of the verb '食べます'?",
        options: ["食べた", "食べない", "食べる", "食べて"],
        optionsReading: ["たべた", "たべない", "たべる", "たべて"],
        correctAnswer: "食べる",
        explanation: "The dictionary form is the base form of the verb. For ru-verbs like 食べます, you replace -masu with -ru.",
      },
      {
        question: "How do you ask for permission politely? 'May I use this pen?'",
        options: [
            "このペンを使ってもいいですか。",
            "このペンを使ってください。",
            "このペンを使いたいです。",
            "このペンを使いませんか。"
        ],
        optionsReading: [
            "このぺんをつかってもいいですか。",
            "このぺんをつかってください。",
            "このぺんをつかいたいです。",
            "このぺんをつかいませんか。"
        ],
        correctAnswer: "このペンを使ってもいいですか。",
        explanation: "The structure '(Verb, te-form) + もいいですか' is used to politely ask for permission.",
      },
      {
        question: "What is the plain past tense (ta-form) of '行きます'?",
        options: ["行った", "行きった", "行んだ", "行って"],
        optionsReading: ["いった", "いきった", "いんだ", "いって"],
        correctAnswer: "行った",
        explanation: "The te-form of 行きます is 行って. The ta-form is created similarly, becoming 行った.",
      },
      {
        question: "What does '〜ませんか' express?",
        options: ["A direct command", "A question about ability", "A polite invitation", "A statement of fact"],
        correctAnswer: "A polite invitation",
        explanation: "'〜ませんか' (e.g., '行きませんか?') is a gentle and polite way to invite someone to do something.",
        explanationReading: "「〜ませんか」（れい：「いきませんか？」）は、だれかをなにかをするようにさそう、ていねいでやさしいほうほうです。"
      },
      {
        question: "What is the correct way to compare two items? 'The train is faster than the bus.'",
        options: ["電車はバスより速いです", "バスは電車より速いです", "電車とバスは速いです", "電車がバスより速いです"],
        optionsReading: ["でんしゃはばすよりはやいです", "ばすはでんしゃよりはやいです", "でんしゃとばすははやいです", "でんしゃがばすよりはやいです"],
        correctAnswer: "電車はバスより速いです",
        explanation: "The structure 'A yori B no hou ga...' is common, but a simpler 'B wa A yori...' also works. Here, '電車' (train) is B and 'バス' (bus) is A.",
      },
      {
        question: "How do you say 'Let's talk at the coffee shop'?",
        options: ["喫茶店で話しませんか", "喫茶店で話したいです", "喫茶店で話しましょう", "喫茶店で話してください"],
        optionsReading: ["きっさてんで はなしませんか", "きっさてんで はなしたいです", "きっさてんで はなしましょう", "きっさてんで はなしてください"],
        correctAnswer: "喫茶店で話しましょう",
        explanation: "The '〜ましょう' form is used to make a direct proposal, equivalent to 'Let's...'.",
      },
      {
        question: "What is the plain negative form of '読みます' (yomimasu)?",
        options: ["読まない", "読めない", "読まなかった", "読みない"],
        optionsReading: ["よまない", "よめない", "よまなかった", "よみない"],
        correctAnswer: "読まない",
        explanation: "For u-verbs, change the final 'i' vowel sound of the stem to 'a' and add '-nai'. So, 'yomi-' becomes 'yoma-nai'.",
      },
      {
        question: "Fill in the blank: '時間がない___、急ぎましょう。'",
        questionReading: "じかんがない___、いそぎましょう",
        options: ["から", "ので", "けど", "A and B"],
        correctAnswer: "A and B",
        explanation: "'から' and 'ので' both mean 'because'. 'から' is a more direct statement of reason, while 'ので' is slightly softer. Both are correct here.",
      },
      {
        question: "How do you say 'I have been to Japan'?",
        options: ["日本へ行きました", "日本へ行くつもりです", "日本へ行ったことがあります", "日本へ行きたいです"],
        optionsReading: ["にほんへいきました", "にほんへいくつもりです", "にほんへいったことがあります", "にほんへいきたいです"],
        correctAnswer: "日本へ行ったことがあります",
        explanation: "The grammar 'ta-form + ことがあります' is used to talk about past experiences.",
      }
    ]
  },
  {
    id: "n4-quiz-1",
    title: "N4 Quiz 1: Potential & Advice",
    level: "N4",
    questions: [
      {
        question: "How do you say 'I can speak Japanese' using the potential form?",
        options: [
            "日本語を話します",
            "日本語を話せます",
            "日本語を話しました",
            "日本語を話したい"
        ],
        optionsReading: [
            "にほんごをはなします",
            "にほんごをはなせます",
            "にほんごをはなしました",
            "にほんごをはなしたい"
        ],
        correctAnswer: "日本語を話せます",
        explanation: "The potential form expresses ability. For u-verbs like 話します, the final 'i' sound in the stem changes to 'e' and -masu is added, becoming 話せます.",
      },
      {
        question: "Which sentence correctly gives advice using '〜方がいいです'?",
        options: [
            "薬を飲みます方がいいです",
            "薬を飲んで方がいいです",
            "薬を飲む方がいいです",
            "薬を飲んだ方がいいです"
        ],
        optionsReading: [
            "くすりをのみますほうがいいです",
            "くすりをのんでほうがいいです",
            "くすりをのむほうがいいです",
            "くすりをのんだほうがいいです"
        ],
        correctAnswer: "薬を飲んだ方がいいです",
        explanation: "To give positive advice ('you should...'), the ta-form (plain past) of the verb is used before 方がいいです.",
      },
      {
        question: "Which of the following means 'I think it will rain'?",
        options: ["雨が降ると思います", "雨が降ると言いました", "雨が降るでしょう", "雨が降るそうです"],
        optionsReading: ["あめがふるとおもいます", "あめがふるといいました", "あめがふるでしょう", "あめがふるそうです"],
        correctAnswer: "雨が降ると思います",
        explanation: "To express your own opinion ('I think...'), you use the plain form of a verb followed by 'と思います'.",
      },
      {
        question: "How do you correctly say 'I cannot eat sushi' in the potential form?",
        options: ["寿司を食べません", "寿司を食べられません", "寿司を食べたくない", "寿司を食べませんです"],
        optionsReading: ["すしをたべません", "すしをたべられません", "すしをたべたくない", "すしをたべませんです"],
        correctAnswer: "寿司を食べられません",
        explanation: "The potential form of the ru-verb '食べる' is '食べられる'. The polite negative is '食べられません'.",
      },
      {
        question: "How do you give negative advice? 'It's better not to drink too much.'",
        options: [
          "飲みすぎない方がいいです",
          "飲みすぎた方がいいです",
          "飲みすぎないでください",
          "飲みすぎてはいけません"
        ],
        optionsReading: [
            "のみすぎないほうがいいです",
            "のみすぎたほうがいいです",
            "のみすぎないでください",
            "のみすぎてはいけません"
        ],
        correctAnswer: "飲みすぎない方がいいです",
        explanation: "For negative advice ('it's better not to...'), you use the plain negative (nai-form) of the verb before '方がいいです'.",
      },
      {
        question: "Fill in the blank: 田中さんはパーティーに___と言っていました。",
        questionReading: "たなかさんはパーティーに___といっていました",
        options: ["来ます", "来ました", "来ない", "来ません"],
        optionsReading: ["きます", "きました", "こない", "きません"],
        correctAnswer: "来ない",
        explanation: "When quoting someone with '〜と言っていました', the verb or adjective inside the quote must be in the plain form. The plain negative of '来ます' is '来ない'.",
      },
      {
        question: "What is the potential form of the verb '泳ぎます' (oyogimasu)?",
        options: ["泳げます", "泳ぎられます", "泳がます", "泳ぎます"],
        optionsReading: ["およげます", "およぎられます", "およがます", "およぎます"],
        correctAnswer: "泳げます",
        explanation: "For u-verbs, the potential is formed by changing the final 'u' sound to 'e' and adding 'ます'. '泳ぎ' (oyogi) becomes '泳げ' (oyoge).",
      },
      {
        question: "How would you give a soft suggestion, like 'How about resting a bit?'",
        options: ["少し休んだらどうですか", "少し休んだ方がいいです", "少し休みなさい", "少し休まなければなりません"],
        optionsReading: ["すこしやすんだらどうですか", "すこしやすんだほうがいいです", "すこしやすみなさい", "すこしやすまなければなりません"],
        correctAnswer: "少し休んだらどうですか",
        explanation: "The structure 'V-ta + らどうですか' is a softer way to give advice, equivalent to 'How about doing V?'",
      },
      {
        question: "How do you say 'He can write kanji'?",
        options: ["彼は漢字を書きます", "彼は漢字を書けます", "彼は漢字を書きたいです", "彼は漢字を書きなさい"],
        optionsReading: ["かれはかんじをかきます", "かれはかんじをかけます", "かれはかんじをかきたいです", "かれはかんじをかきなさい"],
        correctAnswer: "彼は漢字を書けます",
        explanation: "The potential form of '書きます' (kakimasu) is '書けます' (kakemasu).",
      },
      {
        question: "What particle is often used with potential verbs to mark the object?",
        options: ["を", "が", "は", "で"],
        correctAnswer: "が",
        explanation: "While 'を' is sometimes used, it is very common for 'が' to replace 'を' to mark the object of a potential verb, emphasizing the ability.",
      }
    ]
  },
  {
    id: "n4-quiz-2",
    title: "N4 Quiz 2: Complex Structures",
    level: "N4",
    questions: [
      {
        question: "Which sentence correctly uses the passive form? 'My cake was eaten by my brother.'",
        options: [
          "弟は私のケーキを食べました。",
          "私は弟にケーキを食べさせました。",
          "私は弟にケーキを食べられました。",
          "弟は私のケーキを食べていました。"
        ],
        optionsReading: [
          "おとうとはわたしのけーきをたべました。",
          "わたしはおとうとにけーきをたべさせました。",
          "わたしはおとうとにけーきをたべられました。",
          "おとうとはわたしのけーきをたべていました。"
        ],
        correctAnswer: "私は弟にケーキを食べられました。",
        explanation: "This is the 'suffering passive'. The subject (私) was negatively affected by the action. The actor (弟) is marked with に.",
      },
      {
        question: "How do you say 'Let's try eating natto.' using the 〜てみる grammar?",
        options: ["納豆を食べます", "納豆を食べてみます", "納豆を食べたいです", "納豆を食べさせます"],
        optionsReading: ["なっとうをたべます", "なっとうをたべてみます", "なっとうをたべたいです", "なっとうをたべさせます"],
        correctAnswer: "納豆を食べてみます",
        explanation: "The structure 'te-form + みる' is used to express trying something out.",
      },
      {
        question: "Which conditional is best for a natural, automatic consequence? 'When you press the button, a sound comes out.'",
        options: ["ボタンを押すと、音が出ます。", "ボタンを押せば、音が出ます。", "ボタンを押したら、音が出ます。", "ボタンを押すなら、音が出ます。"],
        optionsReading: ["ぼたんをおすと、おとがでます。", "ぼたんをおせば、おとがでます。", "ぼたんをおしたら、おとがでます。", "ぼたんをおすなら、おとがでます。"],
        correctAnswer: "ボタンを押すと、音が出ます。",
        explanation: "The 'と' conditional is used when B is a natural or inevitable result of A.",
      },
      {
        question: "Which sentence means 'My friend gave me a ticket.'?",
        options: [
          "私は友達に切符をあげました。",
          "友達は私に切符をもらいました。",
          "友達は私に切符をくれました。",
          "私は友達に切符をくれました。"
        ],
        optionsReading: [
            "わたしはともだちにきっぷをあげました。",
            "ともだちはわたしにきっぷをもらいました。",
            "ともだちはわたしにきっぷをくれました。",
            "わたしはともだちにきっぷをくれました。"
        ],
        correctAnswer: "友達は私に切符をくれました。",
        explanation: "くれる is used when someone gives something to you or your in-group. The giver is the subject.",
      },
      {
        question: "What is a casual way to say '〜なければなりません' (must do)?",
        options: ["〜なくてもいい", "〜ないでください", "〜なきゃ / 〜ないと", "〜たいです"],
        optionsReading: ["〜なくてもいい", "〜ないでください", "〜なきゃ / 〜ないと", "〜たいです"],
        correctAnswer: "〜なきゃ / 〜ないと",
        explanation: "The '〜なきゃ' (a contraction of 'nakereba') and '〜ないと' (literally 'if I don't...') are common casual equivalents for expressing obligation.",
      },
      {
        question: "How do you say 'I am thinking of going to Japan'?",
        options: ["日本へ行きたいと思います", "日本へ行こうと思います", "日本へ行くと思います", "日本へ行ってみます"],
        optionsReading: ["にほんへいきたいとおもいます", "にほんへいこうとおもいます", "にほんへいくとおもいます", "にほんへいってみます"],
        correctAnswer: "日本へ行こうと思います",
        explanation: "The volitional form (〜う/〜よう) + と思います is used to express a decision or intention you've been considering.",
      },
      {
        question: "Which conditional is used to give a recommendation based on what someone else said?",
        options: ["と", "ば", "たら", "なら"],
        correctAnswer: "なら",
        explanation: "'なら' is used in response to a statement. If someone says 'I want to go to Japan', you can reply '日本へ行くなら、京都がいいですよ' (If you're going to Japan, Kyoto is good).",
      },
      {
        question: "What is the passive form of '見ます' (mimasu)?",
        options: ["見られます", "見せます", "見させられます", "見ます"],
        optionsReading: ["みられます", "みせます", "みさせられます", "みます"],
        correctAnswer: "見られます",
        explanation: "For ru-verbs, the passive is formed by changing '-ru' to '-rareru'. '見る' becomes '見られる'.",
      },
      {
        question: "Which sentence means 'I received a book from my teacher'?",
        options: [
          "先生が私に本をくれました。",
          "私は先生に本をあげました。",
          "私は先生に本をもらいました。",
          "先生は私に本をもらいました。"
        ],
        optionsReading: [
            "せんせいがわたしにほんをくれました。",
            "わたしはせんせいにほんをあげました。",
            "わたしはせんせいにほんをもらいました。",
            "せんせいはわたしにほんをもらいました。"
        ],
        correctAnswer: "私は先生に本をもらいました。",
        explanation: "もらう (morau) is used when the subject receives an item. The giver is marked with 'に' or 'から'.",
      },
      {
        question: "What does the volitional form express?",
        options: ["Ability or potential", "Intention or suggestion", "Obligation or necessity", "Past experience"],
        correctAnswer: "Intention or suggestion",
        explanation: "The volitional form (行こう, 食べよう) is used to say 'Let's...' or to state one's own intention ('I will...').",
      }
    ]
  },
  {
    id: "n5-comprehensive",
    title: "Comprehensive N5 Review",
    level: "N5",
    questions: [
      // 1-5: Basic Sentence Structure & Particles
      {
        question: "私は___です。",
        questionReading: "わたしは___です",
        options: ["学生", "学生を", "学生が", "学生に"],
        optionsReading: ["がくせい", "がくせいを", "がくせいが", "がくせいに"],
        correctAnswer: "学生",
        explanation: "AはBです (A is B) is a fundamental sentence pattern. No particle is needed before です.",
      },
      {
        question: "猫___魚を食べました。",
        questionReading: "ねこ___さかなをたべました",
        options: ["は", "が", "を", "の"],
        correctAnswer: "が",
        explanation: "が is used here to specify the subject performing the action. While は could also be used to mark 'cat' as the topic, が emphasizes that it was the cat (and not something else) that ate the fish.",
      },
      {
        question: "これは田中さん___傘です。",
        questionReading: "これはたなかさん___かさです",
        options: ["を", "の", "が", "は"],
        correctAnswer: "の",
        explanation: "の is the possessive particle, indicating that the umbrella belongs to Tanaka-san.",
      },
      {
        question: "毎日、公園___散歩します。",
        questionReading: "まいにち、こうえん___さんぽします",
        options: ["に", "へ", "で", "を"],
        correctAnswer: "で",
        explanation: "で marks the location of an action. Since 'strolling' is an action, 公園で is correct.",
      },
      {
        question: "7時___起きます。",
        questionReading: "しちじ___おきます",
        options: ["に", "で", "へ", "と"],
        correctAnswer: "に",
        explanation: "に is used to mark a specific point in time.",
      },
      // 6-10: Verbs (Masu-form)
      {
        question: "昨日、何を___か。",
        questionReading: "きのう、なにを___か",
        options: ["します", "しました", "しません", "しませんでした"],
        correctAnswer: "しました",
        explanation: "昨日 (yesterday) indicates the past, so the past tense polite form しました is required.",
      },
      {
        question: "明日、映画を___。",
        questionReading: "あした、えいがを___",
        options: ["見ます", "見ました", "見ません", "見ませんでした"],
        correctAnswer: "見ます",
        explanation: "明日 (tomorrow) indicates the future, so the present/future polite form 見ます is correct.",
      },
      {
        question: "今朝、コーヒーを___。",
        questionReading: "けさ、こーひーを___",
        options: ["飲みます", "飲みません", "飲みました", "飲みませんでした"],
        correctAnswer: "飲みませんでした",
        explanation: "This is a trick question. Without more context, any could be right, but let's assume a negative past action. The past negative polite form is 飲みませんでした.",
      },
      {
        question: "A: 一緒に帰りませんか。 B: いいですね。___。",
        questionReading: "A: いっしょにかえりませんか。 B: いいですね。___。",
        options: ["帰りましょう", "帰ります", "帰りました", "帰りません"],
        optionsReading: ["かえりましょう", "かえります", "かえりました", "かえりません"],
        correctAnswer: "帰りましょう",
        explanation: "The suggestion 〜ませんか is often answered with the volitional 〜ましょう (Let's...).",
      },
      {
        question: "すみません、写真を___ください。",
        questionReading: "すみません、しゃしんを___ください",
        options: ["撮って", "撮ります", "撮る", "撮り"],
        optionsReading: ["とって", "とります", "とる", "とり"],
        correctAnswer: "撮って",
        explanation: "To make a request, use the te-form of the verb + ください.",
      },
      // 11-15: Adjectives
      {
        question: "このラーメンはとても___。",
        questionReading: "このらーめんはとても___",
        options: ["おいしいです", "おいしです", "おいしいです", "おいしい"],
        correctAnswer: "おいしいです",
        explanation: "An i-adjective at the end of a polite sentence keeps its い and adds です.",
      },
      {
        question: "昨日のテストは___なかったです。",
        questionReading: "きのうのてすとは___かったです",
        options: ["やさしく", "やさしい", "やさしかった", "やさしいく"],
        optionsReading: ["やさしく", "やさしい", "やさしかった", "やさしいく"],
        correctAnswer: "やさしく",
        explanation: "The negative past of an i-adjective is 〜くなかったです. So, やさしい becomes やさしくなかったです.",
      },
      {
        question: "富士山は___山です。",
        questionReading: "ふじさんは___やまです",
        options: ["有名", "有名な", "有名の", "有名で"],
        optionsReading: ["ゆうめい", "ゆうめいな", "ゆうめいの", "ゆうめいで"],
        correctAnswer: "有名な",
        explanation: "When a na-adjective comes before a noun, な must be added.",
      },
      {
        question: "この部屋はあまり___。",
        questionReading: "このへやはあまり___",
        options: ["静かです", "静かじゃありません", "静かでした", "静か"],
        optionsReading: ["しずかです", "しずかじゃありません", "しずかでした", "しずか"],
        correctAnswer: "静かじゃありません",
        explanation: "あまり (not very) is used with negative forms. The negative of a na-adjective is 〜じゃありません or 〜ではありません.",
      },
      {
        question: "Which one is NOT a correct past form of an adjective?",
        options: ["楽しかったです", "静かでした", "よかったでした", "きれいでした"],
        optionsReading: ["たのしかったです", "しずかでした", "よかったでした", "きれいでした"],
        correctAnswer: "よかったでした",
        explanation: "いいです has an irregular conjugation. Its past form is よかったです, not よかったでした.",
      },
      // 16-25: Plain forms & Te-forms
      {
        question: "What is the dictionary form of '書きます'?",
        options: ["書く", "書いて", "書かない", "書いた"],
        optionsReading: ["かく", "かいて", "かかない", "かいた"],
        correctAnswer: "書く",
        explanation: "For u-verbs ending in -kimasu, the dictionary form ends in -ku.",
      },
      {
        question: "What is the te-form of '飲みます'?",
        options: ["飲んで", "飲って", "飲みて", "飲んで"],
        correctAnswer: "飲んで",
        explanation: "For u-verbs ending in -mimasu, the te-form ends in -nde.",
      },
      {
        question: "___前に、手を洗います。",
        questionReading: "___まえに、てをあらいます",
        options: ["食べる", "食べます", "食べた", "食べて"],
        correctAnswer: "食べる",
        explanation: "The grammar 'Verb (dictionary form) + 前に' means 'before doing V'.",
      },
      {
        question: "テレビを___、寝ました。",
        questionReading: "てれびを___、ねました",
        options: ["見て", "見って", "見えて", "見て"],
        correctAnswer: "見て",
        explanation: "The te-form can be used to connect sequential actions. 'I watched TV, and then I slept.'",
      },
      {
        question: "ここでタバコを___もいいですか。",
        questionReading: "ここでたばこを___もいいですか",
        options: ["吸って", "吸います", "吸う", "吸った"],
        correctAnswer: "吸って",
        explanation: "The pattern 'V-te form + もいいですか' is used to ask for permission.",
      },
      {
        question: "今、雨が___。",
        questionReading: "いま、あめが___",
        options: ["降っています", "降ります", "降りました", "降って"],
        correctAnswer: "降っています",
        explanation: "'V-te form + います' is used to describe an action in progress.",
      },
      {
        question: "What is the plain past (ta-form) of '話します'?",
        options: ["話した", "話して", "話す", "話さない"],
        optionsReading: ["はなした", "はなして", "はなす", "はなさない"],
        correctAnswer: "話した",
        explanation: "The te-form is 話して (hanashite), so the ta-form is 話した (hanashita).",
      },
      {
        question: "日本へ___ことがあります。",
        questionReading: "にほんへ___ことがあります",
        options: ["行った", "行きます", "行く", "行って"],
        correctAnswer: "行った",
        explanation: "'V-ta form + ことがあります' means 'to have the experience of doing V'.",
      },
      {
        question: "What is the plain negative form of '見ます'?",
        options: ["見ない", "見ないで", "見ません", "見えません"],
        optionsReading: ["みない", "みないで", "みません", "みえません"],
        correctAnswer: "見ない",
        explanation: "For ru-verbs, the plain negative is formed by replacing -ru with -nai.",
      },
      {
        question: "___後で、散歩に行きます。",
        questionReading: "___あとで、さんぽにいきます",
        options: ["食べた", "食べます", "食べる", "食べて"],
        correctAnswer: "食べた",
        explanation: "The grammar 'V-ta form + 後で' means 'after doing V'.",
      },
      // 26-30: Desire & Comparison
      {
        question: "私は映画が___たいです。",
        questionReading: "わたしはえいがが___たいです",
        options: ["見", "見え", "見せ", "見"],
        correctAnswer: "見",
        explanation: "To express desire, attach -tai to the stem of the verb. The stem of 見ます is 見.",
      },
      {
        question: "犬___猫___どちらの方が好きですか。",
        questionReading: "いぬ___ねこ___どちらのほうがすきですか",
        options: ["と / と", "か / か", "や / や", "も / も"],
        correctAnswer: "と / と",
        explanation: "The structure 'AとBとどちら...' is used to ask for a choice between two items.",
      },
      {
        question: "バス___電車の方が速いです。",
        questionReading: "ばす___でんしゃのほうがはやいです",
        options: ["より", "から", "まで", "ほど"],
        correctAnswer: "より",
        explanation: "'AよりBの方が...' means 'B is more... than A'.",
      },
      {
        question: "What is the negative past of '見たいです'?",
        options: ["見たかったです", "見たくなかったです", "見たくありませんでした", "B and C"],
        correctAnswer: "B and C",
        explanation: "The -tai form conjugates like an i-adjective. Its past negative is both 〜たくなかったです and 〜たくありませんでした.",
      },
      {
        question: "世界で東京が一番___。",
        questionReading: "せかいでとうきょうがいちばん___",
        options: ["大きい", "大きいです", "大きい町", "大きい町です"],
        correctAnswer: "大きい町です",
        explanation: "To say 'Tokyo is the biggest city', you need to complete the sentence. '大きい町です' (is a big city) works best. '一番' means 'the most'.",
      },
      // 31-40: Miscellaneous
      {
        question: "Which one means 'and then'?",
        options: ["それから", "そして", "A and B", "でも"],
        correctAnswer: "A and B",
        explanation: "Both それから and そして can be used to connect sentences sequentially.",
      },
      {
        question: "How many people are there? '___人がいますか。'",
        questionReading: "___ひとがいますか",
        options: ["何人", "何時", "何", "どこ"],
        optionsReading: ["なんにん", "なんじ", "なに", "どこ"],
        correctAnswer: "何人",
        explanation: "何人 (nannin) is the question word for 'how many people'.",
      },
      {
        question: "Fill in the blank: 'ペン___貸してください。'",
        questionReading: "ぺん___かしてください",
        options: ["を", "が", "は", "に"],
        correctAnswer: "を",
        explanation: "を marks the direct object of the verb 貸す (to lend).",
      },
      {
        question: "Which direction is 'left'?",
        options: ["右", "左", "上", "下"],
        optionsReading: ["みぎ", "ひだり", "うえ", "した"],
        correctAnswer: "左",
        explanation: "左 (hidari) means left. 右 (migi) means right.",
      },
      {
        question: "A: これは何ですか。 B: ___は本です。",
        questionReading: "A: これはなんですか。 B: ___はほんです。",
        options: ["これ", "それ", "あれ", "どれ"],
        correctAnswer: "それ",
        explanation: "When someone asks about something near them (これ), you refer to it as それ because it is near them (the listener).",
      },
      {
        question: "What is the counter for flat, thin objects like paper?",
        options: ["〜枚", "〜本", "〜冊", "〜個"],
        optionsReading: ["〜まい", "〜ほん", "〜さつ", "〜こ"],
        correctAnswer: "〜枚",
        explanation: "枚 (mai) is used to count flat objects.",
      },
      {
        question: "How do you say 'to give a present to a friend'?",
        options: ["友達にプレゼントをくれます", "友達にプレゼントをもらいます", "友達にプレゼントをあげます", "友達はプレゼントをあげます"],
        optionsReading: ["ともだちにぷれぜんとをくれます", "ともだちにぷれぜんとをもらいます", "ともだちにぷれぜんとをあげます", "ともだちはぷれぜんとをあげます"],
        correctAnswer: "友達にプレゼントをあげます",
        explanation: "あげる is used when you (the subject, implied) give something to someone else.",
      },
      {
        question: "Choose the correct verb for 'wearing a hat'.",
        options: ["着ます", "履きます", "かぶります", "します"],
        optionsReading: ["きます", "はきます", "かぶります", "します"],
        correctAnswer: "かぶります",
        explanation: "Japanese uses different verbs for wearing different items. かぶります is for items worn on the head.",
      },
      {
        question: "What does '〜が好きです' mean?",
        options: ["to want", "to like", "to be good at", "to be able to do"],
        correctAnswer: "to like",
        explanation: "The pattern 'Noun + が好きです' is used to express that you like something.",
      },
      {
        question: "Which particle means 'also' or 'too'?",
        options: ["も", "の", "と", "か"],
        correctAnswer: "も",
        explanation: "も replaces は or が to mean 'also'. For example, '私も学生です' (I am also a student).",
      }
    ]
  },
  {
    id: "n4-comprehensive",
    title: "Comprehensive N4 Review",
    level: "N4",
    questions: [
      // 1-5: Potential & Passive
      {
        question: "日本語の新聞が___ますか。",
        questionReading: "にほんごのしんぶんが___ますか",
        options: ["読め", "読み", "読んで", "読ま"],
        correctAnswer: "読め",
        explanation: "The potential form of 読みます is 読めます, meaning 'can read'.",
      },
      {
        question: "私は弟にケーキを___。",
        questionReading: "わたしはおとうとにけーきを___",
        options: ["食べました", "食べられました", "食べさせました", "食べてあげました"],
        optionsReading: ["たべました", "たべられました", "たべさせました", "たべてあげました"],
        correctAnswer: "食べられました",
        explanation: "This is the 'suffering passive', where the speaker was negatively affected by their brother eating the cake.",
      },
      {
        question: "この漢字は難しくて___。",
        questionReading: "このかんじはむずかしくて___",
        options: ["書けません", "書きません", "書かせません", "書かれません"],
        optionsReading: ["かけません", "かきません", "かかせません", "かかれません"],
        correctAnswer: "書けません",
        explanation: "The potential negative form 書けません (can't write) fits the context of the kanji being difficult.",
      },
      {
        question: "What is the passive form of '叱ります' (shikarimasu - to scold)?",
        options: ["叱られます", "叱れます", "叱らせます", "叱られます"],
        correctAnswer: "叱られます",
        explanation: "For u-verbs, the passive is formed by changing the 'i' stem vowel to 'a' and adding 'remasu'. 'shikari-' becomes 'shikara-remasu'.",
      },
      {
        question: "The actor of a passive sentence is marked by which particle?",
        options: ["に", "を", "で", "が"],
        correctAnswer: "に",
        explanation: "In a passive sentence, the person performing the action is marked with the particle に.",
      },
      // 6-10: Causative & Giving/Receiving
      {
        question: "母は私に部屋を___。",
        questionReading: "はははわたしにへやを___",
        options: ["掃除させました", "掃除されました", "掃除してもらいました", "掃除してあげました"],
        optionsReading: ["そうじさせました", "そうじされました", "そうじしてもらいました", "そうじしてあげました"],
        correctAnswer: "掃除させました",
        explanation: "The causative form 〜させる means 'to make/let someone do'. Here, 'My mother made me clean the room.'",
      },
      {
        question: "先生が私に本を___。",
        questionReading: "せんせいがわたしにほんを___",
        options: ["あげました", "もらいました", "くれました", "さしあげました"],
        optionsReading: ["あげました", "もらいました", "くれました", "さしあげました"],
        correctAnswer: "くれました",
        explanation: "くれる is used when someone of equal or higher status gives something to you (the speaker).",
      },
      {
        question: "私は友達に写真を___。",
        questionReading: "わたしはともだちにしゃしんを___",
        options: ["見せてもらいました", "見せてくれました", "見せてあげました", "見せられました"],
        optionsReading: ["みせてもらいました", "みせてくれました", "みせてあげました", "みせられました"],
        correctAnswer: "見せてもらいました",
        explanation: "V-te + もらう means you received the favor of someone doing V for you. 'I had my friend show me the photos.'",
      },
      {
        question: "The causative-passive form 〜させられる expresses...",
        options: ["being able to do something", "being forced to do something", "wanting to do something", "trying to do something"],
        correctAnswer: "being forced to do something",
        explanation: "The causative-passive combines the meaning of being made to do something and the passive voice. It implies being forced against one's will.",
      },
      {
        question: "How do you say 'My friend helped me with my homework'?",
        options: ["友達は宿題を手伝ってくれました。", "私は友達に宿題を手伝わせました。", "私は友達に宿題を手伝われました。", "友達は宿題を手伝ってみました。"],
        optionsReading: ["ともだちはしゅくだいをてつだってくれました。", "わたしはともだちに宿題をてつだわせました。", "わたしはともだちに宿題をてつだわれました。", "ともだちはしゅくだいをてつだってみました。"],
        correctAnswer: "友達は宿題を手伝ってくれました。",
        explanation: "V-te + くれる means someone did you the favor of doing V. 'My friend gave me the favor of helping.'",
      },
      // 11-15: Conditionals
      {
        question: "春に___と、花が咲きます。",
        questionReading: "はるに___と、はながさきます",
        options: ["なる", "なれば", "なったら", "なるなら"],
        correctAnswer: "なる",
        explanation: "The と conditional is used for natural, inevitable results. It follows the dictionary form of the verb.",
      },
      {
        question: "お金が___、旅行に行きたいです。",
        questionReading: "おかねが___、りょこうにいきたいです",
        options: ["あると", "あれば", "あったら", "あるなら"],
        correctAnswer: "あったら",
        explanation: "The たら conditional is the most versatile and is used for specific, one-time situations. 'If/when I have money...'",
      },
      {
        question: "安けれ___、買います。",
        questionReading: "やすけれ___、かいます",
        options: ["ば", "と", "たら", "なら"],
        correctAnswer: "ば",
        explanation: "The ば conditional for i-adjectives is formed by changing the final い to ければ.",
      },
      {
        question: "A: 日本へ行きたいです。 B: 日本へ行く___、京都がおすすめです。",
        questionReading: "A: にほんへいきたいです。 B: にほんへいく___、きょうとがおすすめです",
        options: ["と", "ば", "たら", "なら"],
        correctAnswer: "なら",
        explanation: "The なら conditional is used to give advice or a suggestion based on what the other person has just said.",
      },
      {
        question: "Which conditional is best for hypothetical situations that are unlikely?",
        options: ["と", "ば", "たら", "All are equal"],
        correctAnswer: "たら",
        explanation: "While others can be used, たら is very commonly used for hypothetical 'if' statements, e.g., 'もし１億円あったら...' (If I had 100 million yen...).",
      },
      // 16-20: Volitional & Obligation
      {
        question: "映画を見に___と思っています。",
        questionReading: "えいがをみに___とおもっています",
        options: ["行こう", "行きたい", "行く", "行ける"],
        optionsReading: ["いこう", "いきたい", "いく", "いける"],
        correctAnswer: "行こう",
        explanation: "The volitional form (〜う/〜よう) + と思います expresses an intention or plan.",
      },
      {
        question: "明日までに宿題を___なりません。",
        questionReading: "あしたまでにしゅくだいを___なりません",
        options: ["しなければ", "します", "しては", "すると"],
        correctAnswer: "しなければ",
        explanation: "The structure 〜なければなりません means 'must do'. It uses the ば form of the negative verb.",
      },
      {
        question: "What is the volitional form of '食べます'?",
        options: ["食べよう", "食べう", "食べろ", "食べたい"],
        optionsReading: ["たべよう", "たべう", "たべろ", "たべたい"],
        correctAnswer: "食べよう",
        explanation: "For ru-verbs, the volitional form is made by replacing -ru with -you.",
      },
      {
        question: "A casual equivalent of 〜なければなりません is...",
        options: ["〜なくてもいい", "〜てはいけません", "〜なきゃ", "〜てください"],
        correctAnswer: "〜なきゃ",
        explanation: "〜なきゃ is a common casual contraction of 〜なければならない.",
      },
      {
        question: "Let's decide what to do tomorrow. 明日何をするか___。",
        questionReading: "あしたなにをするか___",
        options: ["決めたい", "決めよう", "決められる", "決めさせる"],
        optionsReading: ["きめたい", "きめよう", "きめられる", "きめさせる"],
        correctAnswer: "決めよう",
        explanation: "The volitional form 決めよう (Let's decide) is the most natural way to complete this sentence.",
      },
      // 21-30: Various Grammar
      {
        question: "このケーキは美味し___です。",
        questionReading: "このけーきはおいし___です",
        options: ["そう", "よう", "みたい", "らしい"],
        correctAnswer: "そう",
        explanation: "V-stem/Adj-stem + そうです means 'looks like' or 'seems'. 美味しそうです means 'It looks delicious'.",
      },
      {
        question: "彼は学生の___です。制服を着ていますから。",
        questionReading: "かれはがくせいの___です。せいふくをきていますから",
        options: ["そう", "よう", "はず", "つもり"],
        correctAnswer: "よう",
        explanation: "〜ようです (it seems that) is used when you make a judgment based on sensory evidence. The uniform is the evidence.",
      },
      {
        question: "日本語を勉強する___に、日本へ来ました。",
        questionReading: "にほんごをべんきょうする___に、にほんへきました",
        options: ["ため", "よう", "あいだ", "ところ"],
        correctAnswer: "ため",
        explanation: "〜ために means 'for the purpose of' or 'in order to'.",
      },
      {
        question: "会議は今、始まるところです。",
        questionReading: "かいぎはいま、はじまるところです",
        options: ["The meeting is about to start.", "The meeting is starting right now.", "The meeting just finished.", "The meeting is a long way off."],
        correctAnswer: "The meeting is about to start.",
        explanation: "V-dictionary form + ところです indicates that an action is just about to happen.",
      },
      {
        question: "ご飯を食べた___です。",
        questionReading: "ごはんをたべた___です",
        options: ["ばかり", "ところ", "はず", "よう"],
        correctAnswer: "ばかり",
        explanation: "V-ta form + ばかりです emphasizes that an action has just recently been completed.",
      },
      {
        question: "What does '〜ておく' mean?",
        options: ["to try doing something", "to finish doing something", "to do something in advance", "to do something by accident"],
        correctAnswer: "to do something in advance",
        explanation: "The grammar 〜ておく (often 〜とく in casual speech) means to do something in preparation for something else.",
      },
      {
        question: "窓が___います。",
        questionReading: "まどが___います",
        options: ["開けて", "開いて", "開けて", "開いて"],
        correctAnswer: "開いて",
        explanation: "This requires the intransitive verb 開く (aku - to open on its own). When describing a state, use the te-form: 開いて (aite) います.",
      },
      {
        question: "Which verb is transitive?",
        options: ["始まる", "閉める", "開く", "入る"],
        optionsReading: ["はじまる", "しめる", "あく", "はいる"],
        correctAnswer: "閉める",
        explanation: "閉める (shimeru - to close something) is transitive; it takes a direct object. The others are intransitive.",
      },
      {
        question: "Without doing 'V'. How do you express this?",
        options: ["V-ないで", "V-なくて", "V-なくても", "V-なければ"],
        correctAnswer: "V-ないで",
        explanation: "V-ないで means 'without doing V' or 'instead of doing V'. For example, '辞書を使わないで、新聞を読みます' (I read the newspaper without using a dictionary).",
      },
      {
        question: "It becomes easy. '___なります。'",
        questionReading: "___なります",
        options: ["やさしく", "やさしいに", "やさしに", "やさしいく"],
        correctAnswer: "やさしく",
        explanation: "To say 'become [adjective]', i-adjectives change い to く (やさしく), and na-adjectives add に (静かになります).",
      },
      // 31-40: Keigo & Miscellaneous
      {
        question: "What is the honorific (尊敬語) version of '見ます'?",
        options: ["ご覧になります", "拝見します", "見られます", "お見せします"],
        optionsReading: ["ごらんになります", "はいけんします", "みられます", "おみせします"],
        correctAnswer: "ご覧になります",
        explanation: "ご覧になります is the special honorific verb for 'to see/watch', used for someone you respect.",
      },
      {
        question: "What is the humble (謙譲語) version of '行きます'?",
        options: ["いらっしゃいます", "参ります", "お行きになります", "行かれます"],
        optionsReading: ["いらっしゃいます", "まいります", "おいきになります", "いかれます"],
        correctAnswer: "参ります",
        explanation: "参ります is the humble verb for 'to go' or 'to come', used when talking about your own actions to someone of higher status.",
      },
      {
        question: "社長は___か。",
        questionReading: "しゃちょうは___か",
        options: ["何と言いました", "何と申しました", "何とおっしゃいました", "何を言われました"],
        optionsReading: ["なんといいました", "なんともうしました", "なんとおっしゃいました", "なにをいわれました"],
        correctAnswer: "何とおっしゃいました",
        explanation: "おっしゃる is the honorific verb for 言う (to say). You use it when asking what a superior (like a company president) said.",
      },
      {
        question: "This book is easy to read. 'この本は___です。'",
        questionReading: "このほんは___です",
        options: ["読みやすい", "読みにくい", "読みそうです", "読むようです"],
        optionsReading: ["よみやすい", "よみにくい", "よみそうです", "よむようです"],
        correctAnswer: "読みやすい",
        explanation: "V-stem + やすい means 'easy to do V'.",
      },
      {
        question: "This PC is hard to use. 'このパソコンは___です。'",
        questionReading: "このぱそこんは___です",
        options: ["使いやすい", "使いにくい", "使いそうです", "使うらしい"],
        optionsReading: ["つかいやすい", "つかいにくい", "つかいそうです", "つかうらしい"],
        correctAnswer: "使いにくい",
        explanation: "V-stem + にくい means 'hard to do V'.",
      },
      {
        question: "How do you express 'too much'?",
        options: ["V-stem + すぎる", "V-te + すぎる", "V-dict + すぎる", "V-nai + すぎる"],
        correctAnswer: "V-stem + すぎる",
        explanation: "The suffix すぎる is attached to the verb stem (e.g., 食べ from 食べます) to mean 'to do V too much'.",
      },
      {
        question: "According to the weather forecast... '天気予報に___と...'",
        questionReading: "てんきよほうに___と",
        options: ["よる", "よれば", "よると", "よって"],
        correctAnswer: "よると",
        explanation: "N + によると is a common way to say 'according to N'.",
      },
      {
        question: "Choose the correct passive verb: 'この本は世界中の人に___います。'",
        questionReading: "このほんはせかいじゅうのひとに___います",
        options: ["読まれて", "読まさせて", "読んで", "読ませて"],
        optionsReading: ["よまれて", "よまさせて", "よんで", "よませて"],
        correctAnswer: "読まれて",
        explanation: "The passive te-form is needed here. '...is being read by people all over the world.'",
      },
      {
        question: "This grammar means 'it is decided that...' or 'it is a rule that...'",
        options: ["〜ことになっています", "〜ことになりました", "〜ことにします", "〜はずです"],
        correctAnswer: "〜ことになっています",
        explanation: "〜ことになっています is used for rules, schedules, or established plans.",
      },
      {
        question: "How do you express 'I've decided to...'?",
        options: ["〜ことになります", "〜ことになっています", "〜ことにします", "〜つもりです"],
        correctAnswer: "〜ことにします",
        explanation: "〜ことにします is used to state a decision you have just made.",
      }
    ]
  }
];
