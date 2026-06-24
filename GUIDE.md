Hello mn, thanks mọi người đã dành thời gian trả lời mấy câu hỏi của e. E có mấy skills & workflow về phần AI mà e có tìm hiểu và đang xài là mong sẽ có ích với mn trong quá trình làm việc săp tới.

## Skills

### 1. [discuss](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/discuss/SKILL.md)

- Do e không thích kiểu one-shot prompting nên làm skill này để hỏi từng câu hỏi dựa trên decision tree (có kèm theo recommendation hướng giải quyết) từ một vấn đề mình input và sẽ hỏi cho đến khi toàn bộ câu hỏi được resolve.
- Có một vấn đề là Claude rất thích làm mặc dù chưa hỏi xong nó cũng tự động implement, nên mọi người có thể kết hợp với plan mode để restrict quyền write của Claude lại.

### 2. [to-spec](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/to-spec/SKILL.md)

- E dùng skill này để tạo spec sau khi dùng skill discuss hoặc khi discuss quá dài sắp vượt context windows thì e thấy viết spec xuống sau đó discuss tiếp sẽ hiệu quả hơn là để Claude auto compact.

### 3. [to-tasks](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/to-tasks/SKILL.md)

- Skill này để rã spec thành các task nhỏ, độc lập, để dễ implement với test.
- Skill này cũng phân loại task nào cần mình cần manually như kiểu kéo prefab, chỉnh UI... (HILT) & task Claude có thể auto làm (AFK)
- Hiện tại có thêm Unity MCP thì các task HILT có thể sẽ giảm bớt rất nhiều, chỗ này e chưa test nhiều nên chưa biết kết quả có ok không nên hiện tại chưa update lại skill.

### 4. [implement](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/implement/SKILL.md)

- Skill này để implement các task được tạo từ to-tasks, nó sẽ check xem task cần implement có bị block bởi task nào không rồi mới implement, sau khi implement xong sẽ thông báo các bước cần manual test.

### 5. [commit](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/commit/SKILL.md)

- Skill check change stage hiện tại để đề xuất commit message theo chuẩn [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), sau đó sẽ có lựa chọn push hay không và xử lý các trường hợp lỗi khi push.

### 5. [create-unity-build-note](https://github.com/NguyenKietttt/dotfiles/blob/main/ai/skills/create-unity-build-note/SKILL.md)

- Skill tạo build note cho mỗi lần build. Mình sẽ chọn platform (Android, iOS), skill sẽ đọc version, build number từ project setting và tổng hợp các commit kể từ build note cuối cùng thành các bullet ngắn gọn, rồi lưu vào file `docs/build-notes-android.md` hoặc `docs/build-notes-ios.md` để tiếp tục cho lần chạy sau.
- Skill này nếu sau này mình có setup CI/CD thì có thể setup trên cloud sẽ đồng bộ hơn.

## Workflow

- Feature lớn: discuss -> to-spec -> to-tasks -> implement từng task.
- Fix bug/chỉnh sửa những phần nhỏ: discuss -> implement.
- Trong flow hiện tại phần test sẽ hoàn toàn là manual, chỗ này e nghĩ có thể kết hợp với Unity MCP để có thể auto test. Phần này thì e đang còn test thêm nên cũng không có update vào skill.

## Third-party plugins
- **[Context7](https://github.com/upstash/context7):** giúp Claude fetch latest docs, mấy phần liên quan đến docs thì Claude dễ bị outdate (knowledge cutoff). Mình có thể đưa web cho Claude đọc nhưng sẽ bị tốn token hơn. Cái này e thấy hũu ích khi làm SDK hay migration mấy cái package mới của Unity. E có thử mirgate cái Unity IAP v4 -> Unity IAP v5 thấy cũng khá ổn.
- **[Repomix](https://github.com/yamadashy/repomix):** nén toàn bộ project thành file cho Claude đọc, dùng khi khởi tạo file CLAUDE.md lần đầu hoặc đụng vào các legacy project. Do Repomix là CLI tool nên không bị tốn token lúc nén, chỉ bị tốn lúc CLAUDE đọc. Nếu xài tool này nên chọn model có context windows 1M sẽ không bị hết context sớm do file cũng khá bự.
- **[skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator):** skill dùng để tạo skill của Athropic, apply mấy cái best practice về skill. E tạo mấy skill trên từ skill này.

## Notes
- 2 skill commit và create-unity-build-note ban đầu e định xài Haiku để đỡ tốn token, nhưng hay bị miss commit và tự ý commit mà chưa cho phép -> chỗ này nên xài Sonnet sẽ ok hơn. 
- Để đỡ bị tốn token Claude thì có một cách là tạo một subagent Gemini CLI headless mode (lúc trước có thể dùng Copilot CLI cũng được mà hiện tại thì công ty đã cắt), free tier Google cho khá nhiều + context 1M nên phù hợp làm mấy việc không liên quan đến logic như commit, tạo note, tóm tắt code...
- E xài advisor Sonnet + Opus (những task nào mà Sonnet không tự tin thì mới call Opus), thấy kết quả cũng khá ổn mà đỡ tốn token hơn là dùng hoàn toàn Opus.
- Phần context windows thì e thấy nên sử dụng dưới 50%, hơn 50% là model dễ bị sai nhiều. Nếu bị auto compact thì những phần quan trọng cũng bị mất, do mình không kiểm soát được nó auto compact phần nào.
- Nhiều khi Claude sẽ đọc code convention của mấy file hiện tại trong project rồi follow nhưng nhiều khi lại không -> có thể giải quyết bằng 2 cách:

    1. Những phần mà formatter không đụng được (vị trí biến, tên biến, access modifier...) - sẽ viết một file unity-conventions.md rồi link vào file CLAUDE.md với instruction là khi viết code phải follow file này.
    2. Những phần mà formatter đụng được (if thì luôn luôn có `{ }`, không xài var... ) - xài hushy.NET + dotnet format để mỗi khi mình commit sẽ auto format những file C#. Chỗ này ban đầu e xài Claude hook + dotnet format để mỗi khi Claude update 1 file thì format, nhưng bị một cái là nếu Claude edit file đó lần nữa trong cùng session thì phải đọc lại file thành ra bị tốn token.