<!-- react-doctor:summary -->

**React Doctor** found **28 issues** in 10 files · 4 errors & 24 warnings · score 56 / 100 (Critical) · full project

**Errors**

- ❌ [`src/components/pomodoro-widget.tsx:27`](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L27) **React Compiler can't optimize this** `set-state-in-effect`
- ❌ [`src/components/pomodoro-widget.tsx:35`](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L35) **React Compiler can't optimize this** `set-state-in-effect`
- ❌ [`src/components/pomodoro-widget.tsx:56`](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L56) **React Compiler can't optimize this** `set-state-in-effect`
- ❌ [`src/components/tasks/create-task-dialog.tsx:29`](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/tasks/create-task-dialog.tsx#L29) **React Compiler doesn't support this syntax** `todo`

<details><summary>24 warnings</summary>

**`package.json`**
- ⚠️ [L0](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/package.json#L0) `unused-dependency`

**`src/app/(dashboard)/dashboard/page.tsx`**
- ⚠️ [L194](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/app/(dashboard)/dashboard/page.tsx#L194) Locale/timezone formatting during render `no-locale-format-in-render`

**`src/app/(dashboard)/quiz/[id]/page.tsx`**
- ⚠️ [L31](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/app/(dashboard)/quiz/[id]/page.tsx#L31) Client-side redirect for navigation `nextjs-no-client-side-redirect`

**`src/app/(dashboard)/tasks/page.tsx`**
- ⚠️ [L107](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/app/(dashboard)/tasks/page.tsx#L107) Locale/timezone formatting during render `no-locale-format-in-render`
- ⚠️ [L147](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/app/(dashboard)/tasks/page.tsx#L147) Button missing explicit type `button-has-type`
- ⚠️ [L158](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/app/(dashboard)/tasks/page.tsx#L158) Locale/timezone formatting during render `no-locale-format-in-render`

**`src/components/dashboard/heatmap-chart.tsx`**
- ⚠️ [L30](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/heatmap-chart.tsx#L30) Redundant manual memoization `react-compiler-no-manual-memoization`
- ⚠️ [L38](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/heatmap-chart.tsx#L38) Locale/timezone formatting during render `no-locale-format-in-render`
- ⚠️ [L51](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/heatmap-chart.tsx#L51) array.find() inside a loop `js-index-maps`
- ⚠️ [L71](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/heatmap-chart.tsx#L71) array.find() inside a loop `js-index-maps`
- ⚠️ [L180](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/heatmap-chart.tsx#L180) Locale/timezone formatting during render `no-locale-format-in-render`

**`src/components/dashboard/weak-topics-chart.tsx`**
- ⚠️ [L0](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/dashboard/weak-topics-chart.tsx#L0) `unused-file`

**`src/components/pomodoro-widget.tsx`**
- ⚠️ [L31](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L31) Missing effect dependencies `exhaustive-deps`
- ⚠️ [L38](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L38) Missing effect dependencies `exhaustive-deps`
- ⚠️ [L72](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L72) Missing effect dependencies `exhaustive-deps`
- ⚠️ [L81](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L81) Unversioned localStorage key `client-localstorage-no-version`
- ⚠️ [L86](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L86) Pure function rebuilt every render `prefer-module-scope-pure-function`
- ⚠️ [L176](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L176) Control missing accessible label `control-has-associated-label`
- ⚠️ [L180](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L180) Control missing accessible label `control-has-associated-label`
- ⚠️ [L184](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L184) Control missing accessible label `control-has-associated-label`
- ⚠️ [L196](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/pomodoro-widget.tsx#L196) Button missing explicit type `button-has-type`

**`src/components/tasks/create-task-dialog.tsx`**
- ⚠️ [L15](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/tasks/create-task-dialog.tsx#L15) Many related useState calls `prefer-useReducer`

**`src/components/ui/dialog.tsx`**
- ⚠️ [L52](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/components/ui/dialog.tsx#L52) Handler on non-interactive element `no-noninteractive-element-interactions`

**`src/lib/ActiveTaskContext.tsx`**
- ⚠️ [L27](https://github.com/userio12/StudyMate-AI/blob/e8abc5dcae0bf929a6599b907443d7bf74817adf/apps/frontend/src/lib/ActiveTaskContext.tsx#L27) Non-component export in component file `only-export-components`

</details>

<sub>Reviewed by [React Doctor](https://react.doctor) for commit `e8abc5d`. See inline comments for fixes.</sub>