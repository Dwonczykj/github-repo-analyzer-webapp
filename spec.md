{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\paperw11900\paperh16840\margl1440\margr1440\vieww36120\viewh17920\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 # Front-end Assignment\
\
## Purpose\
Our test is designed to be open-ended and non-prescriptive, and this is by design. We understand and appreciate that developers possess diverse sets of skills and talents, each with their own unique toolbox. Our goal is to gain insight into your individual abilities and what you consider significant in your work. We look forward to discovering your talents and skills throughout this assessment.\
\
## Assessment Overview\
\
Create an application using any Javascript Framework of your choice, which will allow a user to connect to GitHub via an API client. The application should provide the user with the ability to navigate between various features as described below.\
\
We will assess your deliverable based on your code neatness, readability, logical flow, visual design and speed.\
All individuals have different strengths so be sure to choose the approach to problem solving that suits your strengths.\
\
## Use cases:\
\
1. As a User I would like to search github in order to view the available repositories for a given search term\
\
2. As a User I would like to select a particular repository in order to view more details of the selected repository\
\
3. As a user, when viewing a given repository, I should be able to clearly see the URL, description, forks count, stargazers count, open issues count etc\
\
4. As a User I would like to link off to the actual GitHub page where the repository is located in order to view the code in the repository\
\
5. As a User I would like to view a list of all the current issues for a repository in order to view the backlog of issues\
\
6. As a User I would like to filter the list of issues between STATE = ["Open" or "Closed"] in order to look through the filtered list\
\
7. Optional: As a User I would like to view a chart that displays the breakdown of issues for the repository (open vs closed) in order to visually see how well built and maintained the repository is\
\
\
Could also add ability to login using OAuth and then make client side checks using the user's authentication token to access github resources...

Should also be able to prompt github copilot using ai to find resources using llm prompts. There may be opensource projects that show us how to do this?

Ability to perform smarter searches for github repos would be cool. 

Add the two bottom searching methodologies:
API Documentation | https://developer.github.com/v3/search/#search-issues
REST API endpoints for search
    - Implement [Text-Matching Highlighting](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#example) in within repo results...
    - [Search code](https://docs.github.com/en/rest/search/search?apiVersion=2022-11-28#search-code)
        - Pull an entire repository's codebase files into a prompt for ai using chunking and then pass user query prompts to that chat completion chain to query information about that repository.
        - [Regex Code Search](https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax#using-regular-expressions)
    - Search commits
    - Search issues and pull requests
    - Search labels
    - Search repositories
    - Search topics
    - Search users
GItHub Search API Documentation | https://developer.github.com/v3/search/

Demonstrate some nice generic type functions, some protocol functions and some nice ts annotations ([vegi-backend-jd.git](https://github.com/vegiApp/peepl-eat-api)).

Host the website on vercel.app with continous integration / tests?
## Additional Points and Notes:\
\
1. Implement the best design possible for the user interface. You are encouraged to make use of interface design solutions such as Twitter Bootstrap, Material and any other libraries you may deem necessary to provide your best solution.\
2. Focus on using best practices in writing TypeScript, CSS, and HTML. Write clearly and use proper MVC structure to write the application. Show us what your typical standard of work, as well as the kind of standards you want to work to.\
\
**Relevant Links**\
\
| **Description** | **URL** |\
| --- | --- |\
| Sample API URL to search by repository name | [https://api.github.com/search/repositories?q=bootstrap](https://api.github.com/search/repositories?q=bootstrap) |\
| API URL to display issues of a repository name | [https://api.github.com/search/issues?q=repo:username/reponame](https://bitbucket.org/one-way/blackswan-tests/src/2bd0eb2fd2fa13c11651b102a6a86c6c53fa6110/bs-angularjs-test.md?at=master&amp;fileviewer=file-view-default) |\
| Example: Display Issues of Bootstrap | [https://api.github.com/repos/twbs/bootstrap/issues?state=all](https://api.github.com/repos/twbs/bootstrap/issues?state=all) |\
| API Documentation | [https://developer.github.com/v3/search/#search-issues](https://developer.github.com/v3/search/#search-issues) |\
| GItHub Search API Documentation | [https://developer.github.com/v3/search/](https://developer.github.com/v3/search/) |\
}