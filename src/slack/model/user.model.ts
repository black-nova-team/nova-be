class User {
  name: string;
  hobby: string;
  mbti: string;
  file: object;
  slackId: string;
  slackName: string;

  constructor(
    name: string,
    hobby: string,
    mbti: string,
    file: object,
    slackId: string,
    slackName: string,
  ) {
    this.name = name;
    this.hobby = hobby;
    this.mbti = mbti;
    this.file = file;
    this.slackId = slackId;
    this.slackName = slackName;
  }
}

export default User;
