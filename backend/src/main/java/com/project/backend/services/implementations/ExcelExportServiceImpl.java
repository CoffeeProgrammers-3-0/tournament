package com.project.backend.services.implementations;

import com.project.backend.dto.category.CategoryResponse;
import com.project.backend.dto.team.PointResponse;
import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.services.interfaces.ExcelExportService;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

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

            Map<Long, String> statisticSheetNames = new LinkedHashMap<>();

            if (statisticResponses != null) {
                for (StatisticResponse stat : statisticResponses) {
                    if (stat != null) {
                        String sheetName = createTeamSheet(workbook, stat, styles);
                        if (stat.getId() != null) {
                            statisticSheetNames.put(stat.getId(), sheetName);
                        }
                    }
                }
            }

            createLeaderboardSheet(workbook, leaderboard, styles, statisticSheetNames);

            workbook.setSheetOrder(LEADERBOARD_SHEET_NAME, 0);

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // =========================
    // LEADERBOARD
    // =========================

    private void createLeaderboardSheet(Workbook wb,
                                        List<TeamLeaderboardResponse> data,
                                        ExcelStyles styles,
                                        Map<Long, String> statisticSheetNames) {

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

                Cell teamCell = row.createCell(1);
                teamCell.setCellValue(t != null && t.getName() != null ? t.getName() : "");
                teamCell.setCellStyle(styles.linkBody);

                if (t != null && t.getId() != null && statisticSheetNames.containsKey(t.getId())) {
                    String targetSheet = statisticSheetNames.get(t.getId());
                    CreationHelper helper = wb.getCreationHelper();
                    Hyperlink link = helper.createHyperlink(HyperlinkType.DOCUMENT);
                    link.setAddress("'" + escapeSheetName(targetSheet) + "'!A1");
                    teamCell.setHyperlink(link);
                    teamCell.setCellStyle(styles.linkBody);
                }

                cell(row, 2, t != null ? t.getEmail() : "", styles.body);
                cell(row, 3, t != null ? t.getCountOfMembers() : null, styles.body);
                cell(row, 4, t != null ? t.getPoints() : null, styles.body);
            }
        }

        finish(sheet, headers.length);
    }

    // =========================
    // TEAM STAT SHEET
    // =========================

    private String createTeamSheet(Workbook wb,
                                   StatisticResponse stat,
                                   ExcelStyles styles) {

        String name = safe(stat.getName());
        String sheetName = uniqueSheetName(wb, sanitize(name));

        Sheet sheet = wb.createSheet(sheetName);

        List<String> juries = resolveJuries(stat);
        int cols = juries.size() + 1;

        int r = 0;

        Row title = sheet.createRow(r++);
        cell(title, 0, "Team: " + name, styles.title);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, cols - 1));

        r++;

        Row header = sheet.createRow(r++);
        cell(header, 0, "Категорія / Критерія", styles.header);

        for (int i = 0; i < juries.size(); i++) {
            cell(header, i + 1, juries.get(i), styles.header);
        }

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

        finish(sheet, cols);

        return sheetName;
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
        boolean hasAny = false;

        for (var cr : safeList(cat.getCriteria())) {
            PointResponse p = map.get(cr.getText());
            if (p != null && p.getPoints() != null) {
                sum += p.getPoints();
                hasAny = true;
            }
        }

        return hasAny ? String.valueOf(sum) : "";
    }

    private PointResponse point(StatisticResponse stat, String jury, String key, String fallback) {
        Map<String, PointResponse> map = safeMap(stat.getPointsPerJury()).get(jury);
        if (map == null) return null;
        PointResponse p = map.get(key);
        return p != null ? p : map.get(fallback);
    }

    private String formatPoint(PointResponse p) {
        if (p == null || p.getPoints() == null) return "";
        return (p.getComment() == null || p.getComment().isBlank())
                ? String.valueOf(p.getPoints())
                : p.getPoints() + "\n" + p.getComment();
    }

    private List<String> resolveJuries(StatisticResponse stat) {
        if (stat.getJuryEmails() != null && !stat.getJuryEmails().isEmpty()) {
            return stat.getJuryEmails();
        }
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

    private void finish(Sheet s, int cols) {
        for (int i = 0; i < cols; i++) {
            s.autoSizeColumn(i);
            int width = s.getColumnWidth(i);
            s.setColumnWidth(i, Math.min(width + 700, 16000));
        }
        s.createFreezePane(1, 2);
    }

    private void cell(Row r, int c, Object val, CellStyle st) {
        Cell cell = r.createCell(c);
        if (val instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else {
            cell.setCellValue(val != null ? val.toString() : "");
        }
        cell.setCellStyle(st);
    }

    private String sanitize(String s) {
        return s == null ? "Sheet" : s.replaceAll("[\\\\/*?:\\[\\]]", "_").trim();
    }

    private String uniqueSheetName(Workbook wb, String base) {
        String name = base;
        int i = 1;

        while (wb.getSheet(name) != null) {
            String suffix = "_" + i++;
            int maxBaseLen = MAX_SHEET_NAME_LENGTH - suffix.length();
            String shortened = base.length() > maxBaseLen ? base.substring(0, maxBaseLen) : base;
            name = shortened + suffix;
        }

        return name.length() > MAX_SHEET_NAME_LENGTH
                ? name.substring(0, MAX_SHEET_NAME_LENGTH)
                : name;
    }

    private String escapeSheetName(String sheetName) {
        return sheetName.replace("'", "''");
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private <T> List<T> safeList(List<T> l) {
        return l == null ? Collections.emptyList() : l;
    }

    private <K, V> Map<K, V> safeMap(Map<K, V> m) {
        return m == null ? Collections.emptyMap() : m;
    }

    // =========================
    // STYLES
    // =========================

    private static class ExcelStyles {

        final CellStyle title;
        final CellStyle header;
        final CellStyle body;
        final CellStyle linkBody;
        final CellStyle category;
        final CellStyle categoryVal;
        final CellStyle criterion;
        final CellStyle criterionVal;
        final CellStyle section;
        final CellStyle bonus;

        ExcelStyles(Workbook wb) {
            Font bold = wb.createFont();
            bold.setBold(true);

            Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleFont.setColor(IndexedColors.WHITE.getIndex());

            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            Font linkFont = wb.createFont();
            linkFont.setColor(IndexedColors.BLUE.getIndex());
            linkFont.setUnderline(FontUnderline.SINGLE.getByteValue());

            title = style(wb, IndexedColors.DARK_BLUE, titleFont, HorizontalAlignment.LEFT);
            header = style(wb, IndexedColors.ROYAL_BLUE, headerFont, HorizontalAlignment.CENTER);
            category = style(wb, IndexedColors.GREY_25_PERCENT, bold, HorizontalAlignment.LEFT);
            categoryVal = style(wb, IndexedColors.LIGHT_TURQUOISE, bold, HorizontalAlignment.CENTER);
            section = style(wb, IndexedColors.GREY_25_PERCENT, bold, HorizontalAlignment.LEFT);
            bonus = style(wb, IndexedColors.LIGHT_ORANGE, bold, HorizontalAlignment.CENTER);

            body = base(wb, HorizontalAlignment.LEFT);
            criterion = base(wb, HorizontalAlignment.LEFT);
            criterion.setIndention((short) 1);

            criterionVal = base(wb, HorizontalAlignment.CENTER);
            criterionVal.setWrapText(true);

            linkBody = base(wb, HorizontalAlignment.LEFT);
            linkBody.setFont(linkFont);
        }

        private CellStyle style(Workbook wb, IndexedColors color, Font font, HorizontalAlignment align) {
            CellStyle s = base(wb, align);
            s.setFillForegroundColor(color.getIndex());
            s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            s.setFont(font);
            return s;
        }

        private CellStyle base(Workbook wb, HorizontalAlignment align) {
            CellStyle s = wb.createCellStyle();
            s.setBorderBottom(BorderStyle.THIN);
            s.setBorderTop(BorderStyle.THIN);
            s.setBorderLeft(BorderStyle.THIN);
            s.setBorderRight(BorderStyle.THIN);
            s.setWrapText(true);
            s.setVerticalAlignment(VerticalAlignment.CENTER);
            s.setAlignment(align);
            return s;
        }
    }
}