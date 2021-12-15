const axios = require('axios');

import React, { useState } from 'react';
const baseUrl = 'http://jservice.io/api';

export async function getQuestionPage(count) {
  try {
    const { data } = fetch(`${baseUrl}/questions?count=${count}`);

    let questionPage = data;

    return questionPage;
  } catch (e) {
    console.log(e);
  }
}

export async function getQuestionData(id) {
  try {
    const response = await fetch(`${baseUrl}/categories`);
    const data = await response.json();
    return {
      questionData: data[0],
    };
  } catch (e) {
    console.log(e);
  }
}
