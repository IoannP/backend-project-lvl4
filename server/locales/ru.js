module.exports = {
  translation: {
    appName: 'Менеджер задач',
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        labels: 'Μетки',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          email: 'Email',
          password: 'Пароль',
          submit: 'Войти',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      users: {
        new: {
          signUp: 'Регистрация',
          firstname: 'Имя',
          lastname: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          submit: 'Сохранить',
        },
        list: {
          id: 'ID',
          fullname: 'Полное имя',
          email: 'Email',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
          submit: 'Создать',
        },
        edit: {
          edit: 'Изменение пользователя',
          firstname: 'Имя',
          lastname: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          submit: 'Изменить',
        },
      },
      statuses: {
        new: {
          create: 'Создание статуса',
          name: 'Наименование',
          submit: 'Создать',

        },
        list: {
          create: 'Создать статус',
          id: 'ID',
          name: 'Наименование',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
        },
        edit: {
          edit: 'Изменение статуса',
          name: 'Наименование',
          submit: 'Изменить',
        },
      },
      tasks: {
        new: {
          create: 'Создание задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          performer: 'Исполнитель',
          marking: 'Метки',
          submit: 'Создать',
        },
        list: {
          create: 'Создать задачу',
          id: 'ID',
          name: 'Наименование',
          status: 'Статус',
          author: 'Автор',
          performer: 'Исполнитель',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
          filter: {
            status: 'Статус',
            performer: 'Исполнитель',
            label: 'Метка',
            checkbox: 'Только мои задачи',
            submit: 'Показать',
          },
        },
        edit: {
          edit: 'Изменение задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          performer: 'Исполнитель',
          marking: 'Метки',
          submit: 'Изменить',
        },
        view: {
          author: 'Автор',
          performer: 'Исполнитель',
          status: 'Статус',
          createdAt: 'Дата создания',
          labels: 'Метки',
          edit: 'Изменить',
          delete: 'Удалить',
        },
      },
      labels: {
        new: {
          create: 'Создание метки',
          name: 'Наименование',
          submit: 'Создать',
        },
        list: {
          create: 'Создать метку',
          id: 'ID',
          name: 'Наименование',
          dateCreated: 'Дата создания',
          edit: 'Изменить',
          delete: 'Удалить',
        },
        edit: {
          edit: 'Изменение метки',
          name: 'Наименование',
          submit: 'Изменить',
        },
      },
    },
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        edit: {
          error: 'Не удалось изменить пользователя',
          autherror: 'Вы не можете редактировать или удалять другого пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          autherror: 'Вы не можете редактировать или удалять другого пользователя',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        edit: {
          error: 'Не удалось изменить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось изменить удалить статус',
          success: 'Статус успешно удалён',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        edit: {
          error: 'Не удалось изменить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: {
            authError: 'Задачу может удалить только её автор',
            dependency: 'Нельзя удалить задачу, у которой есть хотя бы одна метка',
          },
          success: 'Задача успешно удалена',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        edit: {
          error: 'Не удалось изменить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          error: 'Метка связана с одной из задач. Нельзя удалить метку.',
          success: 'Метка успешно удалена',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
    },
  },
};
