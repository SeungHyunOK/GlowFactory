// 중복 인플루언서 제거 스크립트
// Node.js 환경에서 실행하세요

const { createClient } = require("@supabase/supabase-js");

// Supabase 클라이언트 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 환경변수를 설정해주세요.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicates() {
  try {
    console.log("🔍 중복 인플루언서 검색 중...");

    // 1. 중복된 데이터 찾기
    const { data: duplicates, error: findError } = await supabase
      .from("influencers")
      .select("name, platform, COUNT(*) as count")
      .group("name, platform")
      .having("COUNT(*) > 1");

    if (findError) {
      console.error("❌ 중복 데이터 조회 오류:", findError);
      return;
    }

    if (!duplicates || duplicates.length === 0) {
      console.log("✅ 중복된 데이터가 없습니다.");
      return;
    }

    console.log(`📊 발견된 중복 그룹: ${duplicates.length}개`);

    let totalRemoved = 0;

    // 2. 각 중복 그룹에서 최신 데이터만 유지
    for (const duplicate of duplicates) {
      console.log(`\n🔍 처리 중: ${duplicate.name} (${duplicate.platform})`);

      const { data: records, error: selectError } = await supabase
        .from("influencers")
        .select("*")
        .eq("name", duplicate.name)
        .eq("platform", duplicate.platform)
        .order("updated_at", { ascending: false });

      if (selectError) {
        console.error(`❌ ${duplicate.name} 조회 오류:`, selectError);
        continue;
      }

      if (records && records.length > 1) {
        // 첫 번째(최신) 제외하고 나머지 삭제
        const idsToDelete = records.slice(1).map((record) => record.id);

        const { error: deleteError } = await supabase
          .from("influencers")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) {
          console.error(`❌ ${duplicate.name} 삭제 오류:`, deleteError);
        } else {
          console.log(`✅ ${duplicate.name} 중복 ${idsToDelete.length}개 제거`);
          totalRemoved += idsToDelete.length;
        }
      }
    }

    console.log(`\n🎉 중복 제거 완료! 총 ${totalRemoved}개 제거`);

    // 3. 결과 확인
    const { data: finalCount, error: countError } = await supabase
      .from("influencers")
      .select("*", { count: "exact", head: true });

    if (!countError) {
      console.log(`📊 현재 총 인플루언서 수: ${finalCount.length}명`);
    }
  } catch (error) {
    console.error("❌ 중복 제거 중 오류:", error);
  }
}

// 스크립트 실행
if (require.main === module) {
  removeDuplicates()
    .then(() => {
      console.log("✅ 스크립트 실행 완료");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ 스크립트 실행 오류:", error);
      process.exit(1);
    });
}

module.exports = { removeDuplicates };
