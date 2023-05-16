// write a github action that runs eslint on the code example in the issue
// and posts a comment with the results
const core = require('@actions/core');
const github = require('@actions/github');
const { ESLint } = require('eslint');

async function run() {
  try {
    const issueNumber = getIssueNumber();
    const code = getCode();
    console.log("the code code: " + code);
    const eslint = new ESLint({ fix: true });
    const results = await eslint.lintText(code);
    const formatter = await eslint.loadFormatter('stylish');
    const message = formatter.format(results);
    await postComment(issueNumber, message);
  } catch (error) {
    core.setFailed(error.message);
  }
}

function getIssueNumber() {
  const issue = github.context.payload.issue;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  return issue.number;
}

// get the code from issue body, the comment is the first part marked as js code (```js ... ```)
function getCode() {
  const issue = github.context.payload.issue;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  const body = issue.body;
  const start = body.indexOf('```js');
  const end = body.indexOf('```', start + 1);
  return body.substring(start + 5, end);
}

async function postComment(issueNumber, message) {
  const token = core.getInput('repo-token') || process.env.GITHUB_TOKEN;
  // log token length
  console.log("token length: " + token.length);
  // log token value with asterisks
  console.log("token value: " + token.replace(/./g, '*'));
  const octokit = github.getOctokit(token);
  await octokit.rest.issues.createComment({
    issue_number: issueNumber,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: message
  });
}

// log program arguments to console
console.log(process.argv);

// dump github action context to console
console.log(JSON.stringify(github.context, null, 2));

// run the action 
run();