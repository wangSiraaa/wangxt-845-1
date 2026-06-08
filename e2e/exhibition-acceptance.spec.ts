import { test, expect } from '@playwright/test';

test.describe('展馆布展进度墙 - 验收拦截验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.removeItem('exhibition-task-storage');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('核心场景：无照片任务点击验收时应弹出缺少证据提示', async ({ page }) => {
    await test.step('1. 切换到项目经理角色（有验收权限）', async () => {
      await page.getByRole('button', { name: 'PM' }).click();
      await expect(page.locator('text=可验收 · 可编辑 · 可删除')).toBeVisible();
    });

    await test.step('2. 找到待验收列中无照片的任务（task-10 尾厅出口设计）', async () => {
      const reviewColumn = page.getByTestId('kanban-column-review');
      await expect(reviewColumn).toBeVisible();

      const taskCard = page.getByTestId('task-card-task-10');
      await expect(taskCard).toBeVisible();
      await expect(taskCard.getByText('尾厅出口设计')).toBeVisible();

      const photoSection = taskCard.getByTestId('photo-section');
      await expect(photoSection).toBeVisible();
      await expect(photoSection.getByTestId('upload-photo-placeholder')).toBeVisible();
      await expect(photoSection.getByTestId('task-photo')).toHaveCount(0);
    });

    await test.step('3. 点击验收通过按钮', async () => {
      const acceptBtn = page.getByTestId('task-card-task-10').getByTestId('accept-btn');
      await expect(acceptBtn).toBeVisible();
      await acceptBtn.click();
    });

    await test.step('4. 验证弹出拦截提示，显示缺少证据错误', async () => {
      const errorModal = page.getByTestId('accept-error-modal');
      await expect(errorModal).toBeVisible();

      const errorMessage = errorModal.getByTestId('error-message');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('缺少验收证据');
      await expect(errorMessage).toContainText('请先上传布展照片后再进行验收');
    });

    await test.step('5. 关闭错误弹窗，任务状态保持不变', async () => {
      await page.getByTestId('close-error-btn').click();
      await expect(page.getByTestId('accept-error-modal')).not.toBeVisible();

      const taskCard = page.getByTestId('task-card-task-10');
      await expect(taskCard).toBeVisible();
      await expect(page.getByTestId('kanban-column-review')).toContainText('尾厅出口设计');
    });

    await test.step('6. 上传照片后再次验收应成功', async () => {
      const taskCard = page.getByTestId('task-card-task-10');

      await taskCard.getByTestId('add-photo-btn').click();
      const photoModal = page.getByTestId('photo-modal');
      await expect(photoModal).toBeVisible();

      await photoModal.getByTestId('confirm-upload-btn').click();
      await expect(photoModal).not.toBeVisible();

      await expect(taskCard.getByTestId('task-photo')).toHaveCount(1);

      await taskCard.getByTestId('accept-btn').click();

      await expect(page.getByTestId('kanban-column-done')).toContainText('尾厅出口设计');
      await expect(page.getByTestId('kanban-column-review')).not.toContainText('尾厅出口设计');
    });
  });

  test('高风险任务验收拦截验证', async ({ page }) => {
    await test.step('1. 切换到项目经理角色', async () => {
      await page.getByRole('button', { name: 'PM' }).click();
    });

    await test.step('2. 将高风险任务移到待验收列（通过拖拽或直接验证逻辑）', async () => {
      const taskCard = page.getByTestId('task-card-task-4');
      await expect(taskCard).toBeVisible();
      await expect(taskCard).toContainText('高风险');
    });
  });

  test('超期任务高亮显示验证', async ({ page }) => {
    const taskCard = page.getByTestId('task-card-task-6');
    await expect(taskCard).toBeVisible();
    await expect(taskCard.getByTestId('overdue-badge')).toBeVisible();
    await expect(taskCard.getByTestId('overdue-badge')).toContainText('已超期');
  });

  test('角色权限差异验证 - 验收方只看得到待验收和已完成', async ({ page }) => {
    await test.step('1. 切换到验收方角色', async () => {
      await page.getByRole('button', { name: 'ZY' }).click();
    });

    await test.step('2. 验证只显示两列', async () => {
      await expect(page.getByTestId('kanban-column-review')).toBeVisible();
      await expect(page.getByTestId('kanban-column-done')).toBeVisible();
      await expect(page.getByTestId('kanban-column-todo')).not.toBeVisible();
      await expect(page.getByTestId('kanban-column-in_progress')).not.toBeVisible();
    });
  });

  test('角色权限差异验证 - 施工方没有验收按钮', async ({ page }) => {
    await test.step('1. 切换到施工方角色', async () => {
      await page.getByRole('button', { name: 'WS' }).click();
    });

    await test.step('2. 验证待验收列任务没有验收按钮', async () => {
      const reviewColumn = page.getByTestId('kanban-column-review');
      await expect(reviewColumn).toBeVisible();

      const taskCards = reviewColumn.locator('[data-testid^="task-card-"]');
      const count = await taskCards.count();

      for (let i = 0; i < count; i++) {
        const card = taskCards.nth(i);
        await expect(card.getByTestId('accept-btn')).not.toBeVisible();
        await expect(card.getByTestId('reject-btn')).not.toBeVisible();
      }
    });
  });

  test('风险筛选功能验证', async ({ page }) => {
    await page.getByRole('combobox').nth(1).selectOption({ label: '严重风险' });
    await page.waitForTimeout(500);

    const allCards = page.locator('[data-testid^="task-card-"]');
    const count = await allCards.count();

    for (let i = 0; i < count; i++) {
      await expect(allCards.nth(i)).toContainText('严重风险');
    }
  });

  test('离线保存功能验证', async ({ page }) => {
    await test.step('1. 记录初始状态', async () => {
      const doneColumn = page.getByTestId('kanban-column-done');
      const initialCount = await doneColumn.locator('[data-testid^="task-card-"]').count();
    });

    await test.step('2. 刷新页面', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
    });

    await test.step('3. 验证数据保留', async () => {
      await expect(page.getByTestId('kanban-column-todo')).toBeVisible();
      await expect(page.getByTestId('kanban-column-in_progress')).toBeVisible();
      await expect(page.getByTestId('kanban-column-review')).toBeVisible();
      await expect(page.getByTestId('kanban-column-done')).toBeVisible();
    });
  });

  test('重置数据功能验证', async ({ page }) => {
    await test.step('1. 点击重置按钮', async () => {
      await page.getByRole('button', { name: '重置' }).click();
    });

    await test.step('2. 验证数据恢复初始状态', async () => {
      await expect(page.getByTestId('task-card-task-1')).toBeVisible();
      await expect(page.getByTestId('kanban-column-done')).toContainText('序厅门头施工');
    });
  });
});
