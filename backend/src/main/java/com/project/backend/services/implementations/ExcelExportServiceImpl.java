package com.project.backend.services.implementations;

import com.project.backend.dto.category.CategoryResponse;
import com.project.backend.dto.team.PointResponse;
import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.services.interfaces.ExcelExportService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    private static final String LEADERBOARD_SHEET_NAME = "Leaderboard";
    private static final int MAX_SHEET_NAME_LENGTH = 31;

    @Override
    public byte[] exportToExcel(List<TeamLeaderboardResponse> leaderboard,
                                List<StatisticResponse> statisticResponses) throws IOException {

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            ExcelStyles styles = new ExcelStyles(workbook);

            createLeaderboardSheet(workbook, leaderboard, styles);

            if (statisticResponses != null) {
                for (StatisticResponse stat : statisticResponses) {
                    if (stat != null) {
                        createTeamSheet(workbook, stat, styles);
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // =========================
    // LEADERBOARD
    // =========================

    private void createLeaderboardSheet(Workbook wb,
                                        List<TeamLeaderboardResponse> data,
                                        ExcelStyles styles) {

        Sheet sheet = wb.createSheet(LEADERBOARD_SHEET_NAME);

        String[] headers = {"Place", "Team", "Email", "Members", "Points"};

        createTitle(sheet, headers.length, "Leaderboard", styles);
        createHeader(sheet, 1, headers, styles);

        int rowIdx = 2;
        int place = 1;

        if (data != null) {
            for (TeamLeaderboardResponse t : data) {
                Row row = sheet.createRow(rowIdx++);
                cell(row, 0, place++, styles.body);
                cell(row, 1, t.getName(), styles.body);
                cell(row, 2, t.getEmail(), styles.body);
                cell(row, 3, t.getCountOfMembers(), styles.body);
                cell(row, 4, t.getPoints(), styles.body);
            }
        }

        finish(sheet, headers.length, rowIdx);
    }

    // =========================
    // TEAM STAT SHEET
    // =========================

    private void createTeamSheet(Workbook wb,
                                 StatisticResponse stat,
                                 ExcelStyles styles) {

        String name = safe(stat.getName());
        String sheetName = uniqueSheetName(wb, sanitize(name));

        Sheet sheet = wb.createSheet(sheetName);

        List<String> juries = resolveJuries(stat);
        int cols = juries.size() + 1;

        int r = 0;

        // TITLE
        Row title = sheet.createRow(r++);
        cell(title, 0, "Team: " + name, styles.title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, cols - 1));

        r++;

        // HEADER (jury emails)
        Row header = sheet.createRow(r++);
        cell(header, 0, "Категорія / Критерія", styles.header);

        for (int i = 0; i < juries.size(); i++) {
            cell(header, i + 1, juries.get(i), styles.header);
        }

        // MATRIX
        for (CategoryResponse cat : safeList(stat.getCategories())) {

            String catName = safe(cat.getTitle());
            String weight = cat.getWeight() != null
                    ? String.format("(w: %.2f)", cat.getWeight())
                    : "(w: -)";

            Row catRow = sheet.createRow(r++);
            catRow.setHeightInPoints(26);

            cell(catRow, 0, catName + " " + weight, styles.category);

            for (int j = 0; j < juries.size(); j++) {
                String jury = juries.get(j);
                String val = categoryScore(stat, jury, cat);
                cell(catRow, j + 1, val, styles.categoryVal);
            }

            // CRITERIA
            for (var cr : safeList(cat.getCriteria())) {

                String text = cr.getText() != null ? cr.getText() : "";

                Row row = sheet.createRow(r++);
                row.setHeightInPoints(38);

                cell(row, 0, "   " + text, styles.criterion);

                for (int j = 0; j < juries.size(); j++) {
                    String jury = juries.get(j);
                    PointResponse p = point(stat, jury, text, catName);
                    cell(row, j + 1, formatPoint(p), styles.criterionVal);
                }
            }

            r++;
        }

        // BONUS
        r++;
        Row bonusTitle = sheet.createRow(r++);
        cell(bonusTitle, 0, "Бонусна інформація", styles.section);
        sheet.addMergedRegion(new CellRangeAddress(r - 1, r - 1, 0, 2));

        Row bonusHeader = sheet.createRow(r++);
        cell(bonusHeader, 0, "Журі", styles.header);
        cell(bonusHeader, 1, "Очки", styles.header);
        cell(bonusHeader, 2, "Коментарі", styles.header);

        for (var e : safeMap(stat.getAdditionalPointsPerJury()).entrySet()) {
            for (PointResponse p : safeList(e.getValue())) {
                Row row = sheet.createRow(r++);
                cell(row, 0, e.getKey(), styles.body);
                cell(row, 1, p != null ? p.getPoints() : "", styles.bonus);
                cell(row, 2, p != null ? p.getComment() : "", styles.body);
            }
        }

        finish(sheet, cols, r);
    }

    // =========================
    // HELPERS
    // =========================

    private String categoryScore(StatisticResponse stat, String jury, CategoryResponse cat) {
        Map<String, PointResponse> map = safeMap(stat.getPointsPerJury()).get(jury);
        if (map == null) return "";

        PointResponse direct = map.get(cat.getTitle());
        if (direct != null) return formatPoint(direct);

        long sum = 0;
        for (var cr : safeList(cat.getCriteria())) {
            PointResponse p = map.get(cr.getText());
            if (p != null && p.getPoints() != null) sum += p.getPoints();
        }
        return sum == 0 ? "" : String.valueOf(sum);
    }

    private PointResponse point(StatisticResponse stat, String jury, String key, String fallback) {
        Map<String, PointResponse> map = safeMap(stat.getPointsPerJury()).get(jury);
        if (map == null) return null;
        return map.getOrDefault(key, map.get(fallback));
    }

    private String formatPoint(PointResponse p) {
        if (p == null || p.getPoints() == null) return "";
        return (p.getComment() == null || p.getComment().isBlank())
                ? String.valueOf(p.getPoints())
                : p.getPoints() + "\n" + p.getComment();
    }

    private List<String> resolveJuries(StatisticResponse stat) {
        if (stat.getJuryEmails() != null) return stat.getJuryEmails();
        return new ArrayList<>(safeMap(stat.getPointsPerJury()).keySet());
    }

    private void createTitle(Sheet s, int cols, String text, ExcelStyles st) {
        Row r = s.createRow(0);
        cell(r, 0, text, st.title);
        s.addMergedRegion(new CellRangeAddress(0, 0, 0, cols - 1));
    }

    private void createHeader(Sheet s, int rIdx, String[] headers, ExcelStyles st) {
        Row r = s.createRow(rIdx);
        for (int i = 0; i < headers.length; i++) {
            cell(r, i, headers[i], st.header);
        }
    }

    private void finish(Sheet s, int cols, int rows) {
        for (int i = 0; i < cols; i++) {
            s.autoSizeColumn(i);
        }
        s.createFreezePane(1, 2);
    }

    private void cell(Row r, int c, Object val, CellStyle st) {
        Cell cell = r.createCell(c);
        if (val instanceof Number n) cell.setCellValue(n.doubleValue());
        else cell.setCellValue(val != null ? val.toString() : "");
        cell.setCellStyle(st);
    }

    private String sanitize(String s) {
        return s == null ? "Sheet" : s.replaceAll("[\\\\/*?:\\[\\]]", "_");
    }

    private String uniqueSheetName(Workbook wb, String base) {
        String name = base;
        int i = 1;
        while (wb.getSheet(name) != null) {
            name = base + "_" + i++;
        }
        return name.length() > MAX_SHEET_NAME_LENGTH
                ? name.substring(0, MAX_SHEET_NAME_LENGTH)
                : name;
    }

    private String safe(String s) { return s == null ? "" : s; }

    private <T> List<T> safeList(List<T> l) {
        return l == null ? Collections.emptyList() : l;
    }

    private <K,V> Map<K,V> safeMap(Map<K,V> m) {
        return m == null ? Collections.emptyMap() : m;
    }

    // =========================
    // STYLES
    // =========================

    private static class ExcelStyles {

        CellStyle title, header, body, category, categoryVal, criterion, criterionVal, section, bonus;

        ExcelStyles(Workbook wb) {

            Font bold = wb.createFont();
            bold.setBold(true);

            title = style(wb, IndexedColors.DARK_BLUE, bold);
            header = style(wb, IndexedColors.BLUE, bold);
            category = style(wb, IndexedColors.GREY_25_PERCENT, bold);
            categoryVal = style(wb, IndexedColors.LIGHT_TURQUOISE, bold);
            section = style(wb, IndexedColors.GREY_25_PERCENT, bold);

            body = base(wb);
            criterion = base(wb);
            criterion.setIndention((short) 1);

            criterionVal = base(wb);
            criterionVal.setWrapText(true);

            bonus = style(wb, IndexedColors.LIGHT_ORANGE, bold);
        }

        private CellStyle style(Workbook wb, IndexedColors color, Font f) {
            CellStyle s = base(wb);
            s.setFillForegroundColor(color.getIndex());
            s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            s.setFont(f);
            return s;
        }

        private CellStyle base(Workbook wb) {
            CellStyle s = wb.createCellStyle();
            s.setBorderBottom(BorderStyle.THIN);
            s.setBorderTop(BorderStyle.THIN);
            s.setBorderLeft(BorderStyle.THIN);
            s.setBorderRight(BorderStyle.THIN);
            s.setWrapText(true);
            s.setVerticalAlignment(VerticalAlignment.CENTER);
            return s;
        }
    }
}