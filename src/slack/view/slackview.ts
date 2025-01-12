const startMessage = {
  text: '캐리커처 게임!',
  blocks: [
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Breaking Bot*\n인적사항과 사진을 입력해주세요!\n당신만의 캐리커처를 통해 새로운 인연을 만들어보아요😊',
      },
      accessory: {
        type: 'image',
        image_url:
          'https://blackout-05-images.s3.us-east-1.amazonaws.com/example.jpeg',
        alt_text: '예시 이미지',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '캐리커쳐 만들기',
            emoji: true,
          },
          style: 'primary',
          action_id: 'open_modal_button',
        },
      ],
    },
    {
      type: 'divider',
    },
  ],
};

const userInfoModal = {
  type: 'modal',
  callback_id: 'user_info_modal',
  title: {
    type: 'plain_text',
    text: '정보 입력하기',
  },
  submit: {
    type: 'plain_text',
    text: '제출',
  },
  blocks: [
    {
      type: 'divider',
    },
    {
      type: 'input',
      block_id: 'name_block',
      element: {
        type: 'plain_text_input',
        action_id: 'name_input',
        placeholder: {
          type: 'plain_text',
          text: '이름을 입력해주세요',
        },
      },
      label: {
        type: 'plain_text',
        text: '이름',
      },
    },
    {
      type: 'input',
      block_id: 'hobby_block',
      element: {
        type: 'plain_text_input',
        action_id: 'hobby_input',
        placeholder: {
          type: 'plain_text',
          text: '취미를 입력해주세요',
        },
      },
      label: {
        type: 'plain_text',
        text: '취미',
      },
    },
    {
      type: 'input',
      block_id: 'mbti_block',
      element: {
        type: 'plain_text_input',
        action_id: 'mbti_input',
        placeholder: {
          type: 'plain_text',
          text: 'MBTI를 입력해주세요',
        },
      },
      label: {
        type: 'plain_text',
        text: 'MBTI',
      },
    },
    {
      type: 'input',
      block_id: 'input_block_id',
      label: {
        type: 'plain_text',
        text: '사진 올리기',
      },
      element: {
        type: 'file_input',
        action_id: 'file_input_action_id_1',
        filetypes: ['jpg', 'png'],
        max_files: 5,
      },
    },
  ],
};

export { startMessage, userInfoModal };
