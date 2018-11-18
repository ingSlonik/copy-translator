#!/usr/bin/env node

const path = require('path');
const clipboardy = require('clipboardy');
const notifier = require('node-notifier');
const translate = require('translate-google');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'from', alias: 'f', type: String },
    { name: 'to', alias: 't', type: String },
];
const { help, from, to } = commandLineArgs(optionDefinitions);

let textOfLastTranslate = "";

function check() {
    const text = clipboardy.readSync();

    if (text !== textOfLastTranslate && text !== "" && text.length < 128) {
        textOfLastTranslate = text;

        const textToTranslate = text.replace("-\n", "").replace("- \n", "").replace("\n", " ");

        translate(textToTranslate, { from, to }).then(res => {
            console.log(`${new Date().toLocaleString()} \t ${from}: ${textToTranslate} \t ${to}: ${res}`);
            notifier.notify(
                {
                    title: 'Copy translator',
                    message: `${from}: ${textToTranslate} \n${to}: ${res}`,
                    icon: path.resolve(__dirname, 'images', 'google-translate.png'),
                    sound: true,
                },
                (err) => {
                    if (err) {
                        console.error(`Error: ${err}`);
                    }
                }
            );
        }).catch(err => {
            console.error(err)
        })
    }

    setTimeout(check, 1000);
}

const logo = `
  _____                    _______                  _       _             
 / ____|                  |__   __|                | |     | |            
| |     ___  _ __  _   _     | |_ __ __ _ _ __  ___| | __ _| |_ ___  _ __ 
| |    / _ \\| '_ \\| | | |    | | '__/ _\` | '_ \\/ __| |/ _\` | __/ _ \\| '__|
| |___| (_) | |_) | |_| |    | | | | (_| | | | \\__ \\ | (_| | || (_) | |   
 \\_____\\___/| .__/ \\__, |    |_|_|  \\__,_|_| |_|___/_|\\__,_|_| \\___/|_|   
            | |     __/ |                                                 
            |_|    |___/        
`;

if (help) {
    console.log(`
${logo}

-h, --help              Display this usage guide.
-f, --from language     For example "en".
-t, --to language       For example "cs".
`);

} else if (from && to) {
    console.log(`
${logo}

Logs:`);
    check();

} else {
    console.log(`
${logo}

Languages "from" and "to" are necessary fill.
Try: "copy-translator --from en --to cs".
`);

}
