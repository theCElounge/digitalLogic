/* ============================================================
   VERILOG TUTORIAL SCRIPT — verilog-lessons.js
   1. Lightweight Verilog syntax highlighter for
      <pre><code class="language-verilog"> blocks
   2. Accessible self-check quizzes: text inputs carry a
      data-answer attribute ("a|b" accepts either); the
      Check button marks .correct/.incorrect and announces
      results through an aria-live feedback line.
   ============================================================ */
(function () {
    'use strict';

    /* ---------- 1. SYNTAX HIGHLIGHTER ---------- */
    var KEYWORDS = ('module endmodule input output inout begin end if else case casez casex ' +
        'endcase default for while assign always initial posedge negedge or and not nand nor ' +
        'xor xnor buf generate endgenerate genvar function endfunction task endtask forever').split(' ');
    var TYPES = 'wire reg integer real parameter localparam signed unsigned'.split(' ');

    var TOKEN_RE = new RegExp(
        '(//[^\\n]*|/\\*[\\s\\S]*?\\*/)' +                    // 1 comment
        '|("(?:[^"\\\\]|\\\\.)*")' +                          // 2 string
        '|(`\\w+|\\$\\w+)' +                                  // 3 directive / system task
        "|(\\b\\d+'\\s*[bBdDhHoO]\\s*[0-9a-fA-FxXzZ_]+|\\b\\d[\\d_]*\\b)" + // 4 number
        '|\\b(' + KEYWORDS.join('|') + ')\\b' +               // 5 keyword
        '|\\b(' + TYPES.join('|') + ')\\b',                   // 6 type
        'g');

    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function highlight(code) {
        var out = '', last = 0, m;
        TOKEN_RE.lastIndex = 0;
        while ((m = TOKEN_RE.exec(code)) !== null) {
            out += esc(code.slice(last, m.index));
            var cls = m[1] ? 'tok-com' : m[2] ? 'tok-str' : m[3] ? 'tok-dir'
                    : m[4] ? 'tok-num' : m[5] ? 'tok-kw' : 'tok-type';
            out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
            last = m.index + m[0].length;
        }
        return out + esc(code.slice(last));
    }

    /* ---------- 2. QUIZ CHECKER ---------- */
    function normalize(s) {
        return s.toLowerCase().replace(/\s+/g, ' ').trim()
                .replace(/\s*([=;,'()\[\]{}<>+&|^~*])\s*/g, '$1');
    }

    function checkQuiz(quiz) {
        var inputs = quiz.querySelectorAll('input[data-answer]');
        var right = 0;
        inputs.forEach(function (inp) {
            var accepted = inp.getAttribute('data-answer').split('|').map(normalize);
            var ok = accepted.indexOf(normalize(inp.value)) !== -1 && inp.value.trim() !== '';
            inp.classList.remove('correct', 'incorrect');
            inp.classList.add(ok ? 'correct' : 'incorrect');
            if (ok) { right++; }
        });
        var fb = quiz.querySelector('.feedback');
        if (fb) {
            var all = right === inputs.length;
            fb.classList.remove('correct', 'incorrect');
            fb.classList.add(all ? 'correct' : 'incorrect');
            fb.textContent = all
                ? '✅ Correct! ' + right + ' of ' + inputs.length + '.'
                : '❌ ' + right + ' of ' + inputs.length + ' correct — fix the highlighted answers and check again.';
        }
    }

    function resetQuiz(quiz) {
        quiz.querySelectorAll('input[data-answer]').forEach(function (inp) {
            inp.value = '';
            inp.classList.remove('correct', 'incorrect');
        });
        var fb = quiz.querySelector('.feedback');
        if (fb) { fb.textContent = ''; fb.classList.remove('correct', 'incorrect'); }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('pre code.language-verilog, pre code.language-tcl, pre code.language-xdc')
            .forEach(function (block) {
                block.innerHTML = highlight(block.textContent);
            });

        document.querySelectorAll('.quiz').forEach(function (quiz) {
            var fb = quiz.querySelector('.feedback');
            if (fb) { fb.setAttribute('role', 'status'); fb.setAttribute('aria-live', 'polite'); }
            var check = quiz.querySelector('.check-steps-btn');
            var reset = quiz.querySelector('.hide-steps-btn');
            if (check) { check.addEventListener('click', function () { checkQuiz(quiz); }); }
            if (reset) { reset.addEventListener('click', function () { resetQuiz(quiz); }); }
        });
    });
}());
