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
  const octokit = github.getOctokit(token);

  const marker = "<!-- lint-action -->";
  const prelude = "## Lint failed :sob:\n\nPlease fix the lint errors in your code example:\n\n";


  const context = {
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  };
  // remove old comment from previous runs
  const { data: comments } = await octokit.rest.issues.listComments({
    issue_number: issueNumber,
    ...context
  });
  const comment = comments.find(comment => comment.user.login === 'github-actions[bot]' && comment.body.startsWith(marker));
  if (comment) {
    console.log("=> removing old comment");
    await octokit.rest.issues.deleteComment({
      comment_id: comment.id,
      ...context
    }); 
  }

  // if lint fails label the issue with "lint-failed"
  if (message.includes('error')) {
    console.log("fail => adding comment and label");
    // post new comment
    await octokit.rest.issues.createComment({
      issue_number: issueNumber,
      body: marker + "\n" + prelude + message,
      ...context
    });

    await octokit.rest.issues.addLabels({
      issue_number: issueNumber,
      labels: ['lint-failed'],
      ...context
    });
  } else {
    console.log("success => removing old label");
    await octokit.rest.issues.removeLabel({
      issue_number: issueNumber,
      name: 'lint-failed',
      ...context
  });
  }
}

// log program arguments to console
console.log(process.argv);

// dump github action context to console
console.log(JSON.stringify(github.context, null, 2));

// run the action 
run();